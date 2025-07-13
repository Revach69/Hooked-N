import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, SafeAreaView, useColorScheme, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './index'; // adjust path if needed
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Filter, Users } from 'lucide-react-native';
import { EventProfile as EventProfileApi, Like, Event } from '../api/entities';
import { Event as EventType, EventProfile } from '../types';
import { mapDbToEventProfile, mapDbToEvent } from '../utils/mappers';
import { isDbEventProfileArray, isDbEvent } from '../utils/typeGuards';
import ProfileFilters from '../components/ProfileFilters';
import ProfileDetailModal from '../components/ProfileDetailModal';
import FirstTimeGuideModal from '../components/FirstTimeGuideModal';
import { errorHandler } from '../utils/errorHandler';

export default function Discovery() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profiles, setProfiles] = useState<EventProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<EventProfile | null>(null);
  const [filteredProfiles, setFilteredProfiles] = useState<EventProfile[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    age_min: 18,
    age_max: 99,
    gender: 'all',
    interests: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<EventProfile | null>(null);
  const [isTabActive, setIsTabActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  

  const loadProfiles = useCallback(async (eventId: string, sessionId: string) => {
    try {
      const allVisibleProfilesDb = await EventProfileApi.filter({ event_id: eventId, is_visible: true });
      if (!isDbEventProfileArray(allVisibleProfilesDb)) {
        throw new Error('Invalid profile data received from database');
      }
      const allVisibleProfiles: EventProfile[] = allVisibleProfilesDb.map(mapDbToEventProfile);
      const userProfile = allVisibleProfiles.find((p) => p.sessionId === sessionId);
      setCurrentUserProfile(userProfile || null);
      const otherUsersProfiles = allVisibleProfiles.filter((p) => p.sessionId !== sessionId);
      setProfiles(otherUsersProfiles);
      if (!userProfile) {
        errorHandler.handleValidationError(['Current user profile not found'], 'Discovery:loadProfiles', 'Current user profile not found for session, redirecting.');
        navigation.navigate('Home');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Discovery:loadProfiles', 'Error loading profiles');
    }
  }, [navigation]);

  const applyFilters = () => {
    if (!currentUserProfile) {
      setFilteredProfiles([]);
      return;
    }
    const tempFiltered = profiles.filter((otherUser: EventProfile) => {
      const iAmInterestedInOther =
        currentUserProfile.interestedIn === 'everyone' ||
        (currentUserProfile.interestedIn === 'men' && otherUser.genderIdentity === 'man') ||
        (currentUserProfile.interestedIn === 'women' && otherUser.genderIdentity === 'woman') ||
        (currentUserProfile.interestedIn === 'non-binary' && otherUser.genderIdentity === 'non-binary');
      const otherIsInterestedInMe =
        otherUser.interestedIn === 'everyone' ||
        (otherUser.interestedIn === 'men' && currentUserProfile.genderIdentity === 'man') ||
        (otherUser.interestedIn === 'women' && currentUserProfile.genderIdentity === 'woman') ||
        (otherUser.interestedIn === 'non-binary' && currentUserProfile.genderIdentity === 'non-binary');
      if (!iAmInterestedInOther || !otherIsInterestedInMe) return false;
      if (!(otherUser.age >= filters.age_min && otherUser.age <= filters.age_max)) return false;
      if (filters.gender !== 'all' && otherUser.genderIdentity !== filters.gender) return false;
      if (filters.interests.length > 0) {
        if (!otherUser.interests?.some((i: string) => filters.interests.includes(i))) return false;
      }
      return true;
    });
    setFilteredProfiles(tempFiltered);
  };

  const loadLikes = useCallback(async (eventId: string, sessionId: string) => {
    try {
      const likes = await Like.filter({ liker_session_id: sessionId, event_id: eventId });
      setLikedProfiles(new Set(likes.map((like: any) => like.liked_session_id)));
    } catch (error) {
      errorHandler.handleError(error, 'Discovery:loadLikes', 'Error loading likes');
    }
  }, []);

  const initializeSession = useCallback(async () => {
    const eventId = await AsyncStorage.getItem('currentEventId');
    const sessionId = await AsyncStorage.getItem('currentSessionId');
    if (!eventId || !sessionId) {
      navigation.navigate('Home');
      return;
    }
    setCurrentSessionId(sessionId);
    const hasSeenGuide = await AsyncStorage.getItem(`hasSeenGuide_${eventId}`);
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
    try {
      const eventsDb = await Event.filter({ id: eventId });
      if (eventsDb.length > 0) {
        if (!isDbEvent(eventsDb[0])) {
          throw new Error('Invalid event data received from database');
        }
        const event = mapDbToEvent(eventsDb[0]);
        setCurrentEvent(event);
      } else {
        navigation.navigate('Home');
        return;
      }
      await Promise.all([loadProfiles(eventId, sessionId), loadLikes(eventId, sessionId)]);
    } catch (error) {
      errorHandler.handleError(error, 'Discovery:initializeSession', 'Error initializing session');
    }
    setIsLoading(false);
  }, [navigation, loadProfiles, loadLikes]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);


  useEffect(() => {
    if (currentUserProfile && profiles.length >= 0) {
      applyFilters();
    }
  }, [profiles, filters, currentUserProfile, applyFilters]);

  useEffect(() => {
    const handleStateChange = (state: AppStateStatus) => {
      setIsTabActive(state === 'active');
    };
    setIsTabActive(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', handleStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!currentSessionId || !currentEvent) return;
    const pollInterval = setInterval(() => {
      if (isTabActive) {
        loadProfiles(currentEvent.id, currentSessionId);
        loadLikes(currentEvent.id, currentSessionId);
      }
    }, 60000);
    return () => clearInterval(pollInterval);
  }, [currentSessionId, currentEvent, isTabActive, loadProfiles, loadLikes]);


  const handleLike = async (likedProfile: EventProfile) => {
    if (likedProfiles.has(likedProfile.sessionId) || !currentUserProfile) return;
    const eventId = await AsyncStorage.getItem('currentEventId');
    const likerSessionId = currentUserProfile.sessionId;
    try {
      setLikedProfiles(prev => new Set([...Array.from(prev), likedProfile.sessionId]));
      const newLike = await Like.create({
        event_id: eventId,
        liker_session_id: likerSessionId,
        liked_session_id: likedProfile.sessionId,
        is_mutual: false,
        liker_notified_of_match: false,
        liked_notified_of_match: false,
      });
      const theirLikesToMe = await Like.filter({
        event_id: eventId,
        liker_session_id: likedProfile.sessionId,
        liked_session_id: likerSessionId,
      });
      if (theirLikesToMe.length > 0) {
        const theirLikeRecord = theirLikesToMe[0];
        await Like.update(newLike.id, { is_mutual: true, liker_notified_of_match: true });
        await Like.update(theirLikeRecord.id, { is_mutual: true, liked_notified_of_match: true });
        alert(`🎉 It's a Match! You and ${likedProfile.firstName} liked each other.`);
        navigation.navigate('Matches');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Discovery:handleLike', 'Error liking profile');
      setLikedProfiles(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(likedProfile.sessionId);
        return newSet;
      });
    }
  };

  const handleProfileTap = (profile: EventProfile) => {
    setSelectedProfileForDetail(profile);
  };

  const handleCloseGuide = async () => {
    const eventId = await AsyncStorage.getItem('currentEventId');
    if (eventId) {
      await AsyncStorage.setItem(`hasSeenGuide_${eventId}`, 'true');
    }
    setShowGuide(false);
  };

  const handleImageError = (sessionId: string) => {
    setImageErrors(prev => ({ ...prev, [sessionId]: true }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUserProfile) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDark && styles.textDark]}>Profile not found</Text>
          <Button onPress={() => navigation.navigate('Home')}>Go Home</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          {currentEvent?.name || 'Discovery'}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.profilesContainer} showsVerticalScrollIndicator={false}>
        {filteredProfiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#9ca3af" />
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              No profiles match your filters
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
              Try adjusting your preferences
            </Text>
          </View>
        ) : (
          filteredProfiles.map((profile) => (
            <Card key={profile.id} style={styles.profileCard}>
              <CardContent style={styles.cardContent}>
                <TouchableOpacity
                  style={styles.profileSection}
                  onPress={() => handleProfileTap(profile)}
                >
                  <View style={styles.imageContainer}>
                    {profile.profilePhotoUrl && !imageErrors[profile.sessionId] ? (
                      <Image
                        source={{ uri: profile.profilePhotoUrl }}
                        style={styles.profileImage}
                        onError={() => handleImageError(profile.sessionId)}
                      />
                    ) : (
                      <View
                        style={[
                          styles.fallbackImage,
                          { backgroundColor: profile.profileColor }
                        ]}
                      >
                        <Text style={styles.profileInitial}>
                          {profile.firstName[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.profileInfo}>
                    <View style={styles.nameAgeRow}>
                      <Text style={[styles.name, isDark && styles.textDark]}>
                        {profile.firstName}
                      </Text>
                      <Text style={[styles.age, isDark && styles.textSecondaryDark]}>
                        {profile.age}
                      </Text>
                    </View>
                    
                    <Text style={[styles.gender, isDark && styles.textSecondaryDark]}>
                      {profile.genderIdentity}
                    </Text>
                    
                    {profile.bio && (
                      <Text style={[styles.bio, isDark && styles.textDark]} numberOfLines={2}>
                        {profile.bio}
                      </Text>
                    )}
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <View style={styles.interestsContainer}>
                        {profile.interests.slice(0, 3).map((interest, index) => (
                          <View key={index} style={styles.interestBadge}>
                            <Text style={styles.interestText}>{interest}</Text>
                          </View>
                        ))}
                        {profile.interests.length > 3 && (
                          <Text style={[styles.moreInterests, isDark && styles.textSecondaryDark]}>
                            +{profile.interests.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleLike(profile)}
                  style={[
                    styles.likeButton,
                    likedProfiles.has(profile.sessionId) && styles.likedButton
                  ]}
                  disabled={likedProfiles.has(profile.sessionId)}
                >
                  <Heart
                    size={24}
                    color={likedProfiles.has(profile.sessionId) ? '#fff' : '#ec4899'}
                    fill={likedProfiles.has(profile.sessionId) ? '#fff' : 'none'}
                  />
                </TouchableOpacity>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>

      <ProfileFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
        visible={showFilters}
      />

      <ProfileDetailModal
        profile={selectedProfileForDetail}
        isVisible={!!selectedProfileForDetail}
        onClose={() => setSelectedProfileForDetail(null)}
      />

      <FirstTimeGuideModal
        visible={showGuide}
        onClose={handleCloseGuide}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
  textSecondaryDark: {
    color: '#d1d5db',
  },
  filterButton: {
    padding: 8,
  },
  profilesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  fallbackImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  age: {
    fontSize: 16,
    color: '#6b7280',
  },
  gender: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#374151',
  },
  moreInterests: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likedButton: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
