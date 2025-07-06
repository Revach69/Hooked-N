
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { AppState, AppStateStatus, Linking, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Heart, MessageCircle, Users, Sparkles } from "lucide-react-native";
import { EventProfile, Like, Message } from "../api/entities";
import ChatModal from "../components/ChatModal";
import ProfileDetailModal from "../components/ProfileDetailModal";

export default function Matches() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const currentSessionId = localStorage.getItem('currentSessionId');
  const eventId = localStorage.getItem('currentEventId');

  const markMatchesAsNotified = useCallback(async (mutualMatchProfiles) => {
    if (!currentSessionId || !eventId || mutualMatchProfiles.length === 0) return;

    const allMutualLikesForEvent = await Like.filter({ event_id: eventId, is_mutual: true });

    for (const matchProfile of mutualMatchProfiles) {
      const myLikeToThem = allMutualLikesForEvent.find(l => 
        l.liker_session_id === currentSessionId && l.liked_session_id === matchProfile.session_id
      );
      if (myLikeToThem && !myLikeToThem.liker_notified_of_match) {
        try {
          await Like.update(myLikeToThem.id, { liker_notified_of_match: true });
        } catch (e) { 
          console.error("Error updating my like notification status:", e); 
        }
      }

      const theirLikeToMe = allMutualLikesForEvent.find(l => 
        l.liker_session_id === matchProfile.session_id && l.liked_session_id === currentSessionId
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

      const profiles = await EventProfile.filter({
        session_id: Array.from(matchedSessionIds),
        event_id: eventId
      });
      
      // Fetch unread message counts for each match
      const profilesWithUnreadCounts = await Promise.all(
        profiles.map(async (profile) => {
          const matchParticipants = [currentSessionId, profile.session_id].sort();
          const matchId = `${matchParticipants[0]}_${matchParticipants[1]}`;
          
          const unreadMessages = await Message.filter({
            match_id: matchId,
            receiver_session_id: currentSessionId,
            is_read: false,
            event_id: eventId
          });
          return { ...profile, unreadCount: unreadMessages.length };
        })
      );
      
      setMatches(profilesWithUnreadCounts.filter(Boolean));
      if (profiles.length > 0) {
        markMatchesAsNotified(profiles);
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
  
  // Check for deep link parameter to auto-open specific chat
  useEffect(() => {
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) return;
      try {
        const url = new URL(initialUrl);
        const openChatSessionId = url.searchParams.get('openChat');
        if (openChatSessionId && matches.length > 0) {
          const matchToOpen = matches.find(m => m.session_id === openChatSessionId);
          if (matchToOpen) {
            setSelectedMatch(matchToOpen);
          }
        }
      } catch (e) {
        // ignore invalid URL
      }
    };
    checkInitialUrl();
  }, [matches]);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={["#ec4899", "#8b5cf6"]} style={styles.headerIcon}>
          <Heart width={32} height={32} color="#fff" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} mutual {matches.length === 1 ? 'connection' : 'connections'} at this event
        </Text>
      </View>

      {/* Matches List */}
      <View>
        {matches.map((match) => (
          <Card key={match.id} style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardRow}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarWrapper}>
                    {match.profile_photo_url && !imageErrorMap[match.session_id] ? (
                      <TouchableOpacity onPress={() => setSelectedProfileForDetail(match)}>
                        <Image
                          source={{ uri: match.profile_photo_url }}
                          style={styles.avatar}
                          onError={() => setImageErrorMap(prev => ({ ...prev, [match.session_id]: true }))}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setSelectedProfileForDetail(match)}
                        style={[styles.avatar, styles.avatarFallback, { backgroundColor: match.profile_color }]}
                      >
                        <Text style={styles.profileInitial}>{match.first_name[0]}</Text>
                      </TouchableOpacity>
                    )}
                    <LinearGradient colors={["#ec4899", "#ef4444"]} style={styles.sparklesBadge}>
                      <Sparkles width={12} height={12} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={styles.name}>{match.first_name}</Text>
                    <Text style={styles.age}>{match.age} years old</Text>
                    <View style={styles.interestsRow}>
                      {match.interests?.slice(0, 2).map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          style={styles.interestBadge}
                        >
                          {interest}
                        </Badge>
                      ))}
                      {match.interests?.length > 2 && (
                        <Badge variant="outline" style={styles.moreBadge}>
                          +{match.interests.length - 2}
                        </Badge>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    onPress={() => setSelectedMatch(match)}
                    style={styles.chatButton}
                    size="icon"
                  >
                    <MessageCircle width={20} height={20} color="#fff" />
                  </Button>
                  {match.unreadCount > 0 && (
                    <Badge style={styles.unreadBadge}>{match.unreadCount}</Badge>
                  )}
                </View>
              </View>
            </CardContent>
          </Card>
        ))}

        {matches.length === 0 && !isLoading && (
          <Card style={styles.emptyCard}>
            <CardContent style={styles.emptyCardContent}>
              <Users width={64} height={64} color="#9ca3af" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptySubtitle}>
                Start liking profiles to find your matches! When someone likes you back, they'll appear here.
              </Text>
              <Button
                onPress={() => navigation.navigate('Discovery')}
                style={styles.discoverButton}
              >
                <Text style={styles.discoverText}>Discover Singles</Text>
              </Button>
            </CardContent>
          </Card>
        )}
      </View>

      {selectedMatch && (
        <ChatModal
          match={selectedMatch}
          onClose={() => {
            setSelectedMatch(null);
            loadMatches(); // Refresh match list to update unread counts after closing modal
          }}
        />
      )}

      {/* Profile Detail Modal */}
      {selectedProfileForDetail && (
        <ProfileDetailModal
          profile={selectedProfileForDetail}
          onClose={() => setSelectedProfileForDetail(null)}
          onLike={() => {
            // Since this is already a match, no need to like again. Just close the modal.
            setSelectedProfileForDetail(null);
          }}
          isLiked={true} // Always true since this is a confirmed match
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 32, alignSelf: 'center', width: '100%', maxWidth: 400 },
  header: { alignItems: 'center', marginBottom: 32 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#111', marginBottom: 4 },
  headerSubtitle: { color: '#6b7280' },
  card: { borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.8)', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardContent: { padding: 24 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#e9d5ff' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#fff', fontWeight: '600', fontSize: 24 },
  sparklesBadge: { position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  name: { fontWeight: '600', fontSize: 18, color: '#111' },
  age: { fontSize: 12, color: '#6b7280' },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  interestBadge: { fontSize: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e9d5ff', color: '#7c3aed', backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  moreBadge: { fontSize: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', color: '#6b7280', paddingHorizontal: 8, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  actions: { alignItems: 'center' },
  chatButton: { backgroundColor: '#ec4899', borderRadius: 9999 },
  unreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, overflow: 'hidden', marginTop: 4 },
  emptyCard: { borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.8)', padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  emptyCardContent: { alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#111', marginBottom: 8 },
  emptySubtitle: { textAlign: 'center', color: '#6b7280', marginBottom: 24 },
  discoverButton: { backgroundColor: '#a855f7', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  discoverText: { color: '#fff', fontWeight: '600' },
});
