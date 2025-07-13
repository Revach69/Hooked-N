
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './index'; // adjust path if needed
import { AppState, AppStateStatus, Linking, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Heart, MessageCircle, Users, Sparkles } from "lucide-react-native";
import { EventProfile as EventProfileApi, Like, Message } from "../api/entities";
import { Match, EventProfile } from '../types';
import { mapDbToMatch, mapDbToEventProfile } from '../utils/mappers';
import { isDbEventProfileArray } from '../utils/typeGuards';
import ChatModal from "../components/ChatModal";
import ProfileDetailModal from "../components/ProfileDetailModal";

interface MatchWithUnreadCount extends Match {
  unreadCount: number;
}

export default function Matches() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [matches, setMatches] = useState<MatchWithUnreadCount[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithUnreadCount | null>(null);
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<EventProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const loadIds = useCallback(async () => {
    const sId = await AsyncStorage.getItem('currentSessionId');
    const eId = await AsyncStorage.getItem('currentEventId');
    setCurrentSessionId(sId);
    setEventId(eId);
  }, []);

  useEffect(() => {
    loadIds();
  }, [loadIds]);

  const markMatchesAsNotified = useCallback(async (mutualMatchProfiles: MatchWithUnreadCount[]) => {
    if (!currentSessionId || !eventId || mutualMatchProfiles.length === 0) return;

    const allMutualLikesForEvent = await Like.filter({ event_id: eventId, is_mutual: true });

    for (const matchProfile of mutualMatchProfiles) {
      const myLikeToThem = allMutualLikesForEvent.find(l => 
        l.liker_session_id === currentSessionId && l.liked_session_id === matchProfile.sessionId
      );
      if (myLikeToThem && !myLikeToThem.liker_notified_of_match) {
        try {
          await Like.update(myLikeToThem.id, { liker_notified_of_match: true });
        } catch (e) { 
          console.error("Error updating my like notification status:", e); 
        }
      }

      const theirLikeToMe = allMutualLikesForEvent.find(l => 
        l.liker_session_id === matchProfile.sessionId && l.liked_session_id === currentSessionId
      );
      if (theirLikeToMe && !theirLikeToMe.liked_notified_of_match) {
         try {
          await Like.update(theirLikeToMe.id, { liked_notified_of_match: true });
        } catch (e) { 
          console.error("Error updating their like notification status:", e); 
        }
      }
    }
  }, [currentSessionId, eventId]);

  const loadMatches = useCallback(async () => {
    if (!currentSessionId || !eventId) {
      setIsLoading(false);
      return;
    }

    try {
      const myLikes = await Like.filter({
        liker_session_id: currentSessionId,
        event_id: eventId,
        is_mutual: true
      });

      const likesToMe = await Like.filter({
        liked_session_id: currentSessionId,
        event_id: eventId,
        is_mutual: true
      });

      const matchedSessionIds = new Set([
        ...myLikes.map(like => like.liked_session_id),
        ...likesToMe.map(like => like.liker_session_id)
      ]);
      
      if (matchedSessionIds.size === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }

      const profilesDb = await EventProfileApi.filter({
        session_id: Array.from(matchedSessionIds),
        event_id: eventId
      });
      
      if (!isDbEventProfileArray(profilesDb)) {
        throw new Error('Invalid profile data received from database');
      }
      const profiles: EventProfile[] = profilesDb.map(mapDbToEventProfile);
      
      // Fetch unread message counts for each match
      const profilesWithUnreadCounts: MatchWithUnreadCount[] = await Promise.all(
        profiles.map(async (profile) => {
          const matchParticipants = [currentSessionId, profile.sessionId].sort();
          const matchId = `${matchParticipants[0]}_${matchParticipants[1]}`;
          
          const unreadMessages = await Message.filter({
            match_id: matchId,
            receiver_session_id: currentSessionId,
            is_read: false,
            event_id: eventId
          });
          
          // Convert EventProfile to Match format
          const match: Match = {
            id: profile.id,
            sessionId: profile.sessionId,
            firstName: profile.firstName,
            profilePhotoUrl: profile.profilePhotoUrl,
            profileColor: profile.profileColor,
            age: profile.age,
            interests: profile.interests || [],
            bio: profile.bio,
            isMutual: true,
            createdAt: profile.createdAt,
          };
          
          return { ...match, unreadCount: unreadMessages.length };
        })
      );
      
      setMatches(profilesWithUnreadCounts.filter(Boolean));
      if (profiles.length > 0) {
        markMatchesAsNotified(profilesWithUnreadCounts);
      }

    } catch (error) {
      console.error("Error loading matches:", error);
    }
    setIsLoading(false);
  }, [currentSessionId, eventId, markMatchesAsNotified]);

  // App state detection for polling
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      setIsTabActive(state === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Real-time polling for match updates
  useEffect(() => {
    loadMatches();

    const pollInterval = setInterval(() => {
      if (isTabActive) {
        loadMatches();
      }
    }, 45000); // Changed from 30 seconds to 45 seconds to reduce API calls

    return () => clearInterval(pollInterval);
  }, [loadMatches, isTabActive]);
  
  const checkInitialUrl = useCallback(async () => {
    const initialUrl = await Linking.getInitialURL();
    if (!initialUrl) return;
  
    try {
      const url = new URL(initialUrl);
      const openChatSessionId = url.searchParams.get('openChat');
      if (openChatSessionId && matches.length > 0) {
        const matchToOpen = matches.find(m => m.sessionId === openChatSessionId);
        if (matchToOpen) {
          setSelectedMatch(matchToOpen);
        }
      }
    } catch (error) {
      console.error("Error processing initial URL:", error);
    }
  }, [matches]);

  // Check for deep link parameter to auto-open specific chat
  useEffect(() => {
    checkInitialUrl();
  }, [checkInitialUrl]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#db2777" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#6b7280' }}>Loading your matches...</Text>
        </View>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#fdf2f8', '#fce7f3']}
          style={styles.emptyGradient}
        >
          <Sparkles size={64} color="#ec4899" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep swiping to find your perfect match!
          </Text>
          <Button
            onPress={() => navigation.navigate('Discovery')}
            style={styles.discoveryButton}
          >
            Start Discovering
          </Button>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>{matches.length} mutual connections</Text>
      </View>

      <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
        {matches.map((match) => (
          <Card key={match.id} style={styles.matchCard}>
            <CardContent style={styles.cardContent}>
              <TouchableOpacity
                style={styles.matchSection}
                onPress={() => {
                  // Convert Match to EventProfile for the detail modal
                  const eventProfile: EventProfile = {
                    id: match.id,
                    eventId: '', // This would need to be passed from parent
                    sessionId: match.sessionId,
                    firstName: match.firstName,
                    email: '', // Not available in Match
                    age: match.age,
                    genderIdentity: '', // Not available in Match
                    interestedIn: '', // Not available in Match
                    profileColor: match.profileColor,
                    profilePhotoUrl: match.profilePhotoUrl || '',
                    isVisible: true, // Default value
                    bio: match.bio,
                    height: undefined,
                    interests: match.interests,
                    createdAt: match.createdAt,
                  };
                  setSelectedProfileForDetail(eventProfile);
                }}
              >
                <View style={styles.avatarContainer}>
                  {match.profilePhotoUrl && !imageErrorMap[match.sessionId] ? (
                    <Image
                      source={{ uri: match.profilePhotoUrl }}
                      style={styles.avatar}
                      onError={() => setImageErrorMap(prev => ({ ...prev, [match.sessionId]: true }))}
                    />
                  ) : (
                    <View
                      style={[styles.avatar, styles.avatarFallback, { backgroundColor: match.profileColor }]}
                    >
                      <Text style={styles.profileInitial}>{match.firstName[0]}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.matchInfo}>
                  <Text style={styles.name}>{match.firstName}</Text>
                  <Text style={styles.age}>{match.age} years old</Text>
                  {match.interests && match.interests.length > 0 && (
                    <View style={styles.interestsContainer}>
                      {match.interests.slice(0, 2).map((interest, index) => (
                        <View key={index} style={styles.interestBadge}>
                          <Text style={styles.interestText}>{interest}</Text>
                        </View>
                      ))}
                      {match.interests.length > 2 && (
                        <Text style={styles.moreInterests}>
                          +{match.interests.length - 2} more
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => setSelectedMatch(match)}
                >
                  <MessageCircle size={20} color="#fff" />
                  <Text style={styles.chatButtonText}>Chat</Text>
                  {match.unreadCount > 0 && (
                    <Badge style={styles.unreadBadge}>{match.unreadCount}</Badge>
                  )}
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        ))}
      </ScrollView>

      <ChatModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      <ProfileDetailModal
        profile={selectedProfileForDetail}
        isVisible={!!selectedProfileForDetail}
        onClose={() => setSelectedProfileForDetail(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  matchCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  matchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  age: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  interestText: {
    fontSize: 10,
    color: '#374151',
  },
  moreInterests: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  unreadBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  discoveryButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
});
