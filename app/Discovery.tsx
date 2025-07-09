import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, SafeAreaView, useColorScheme, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './index'; // adjust path if needed
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Filter, Users } from 'lucide-react-native';
import { EventProfile, Like, Event } from '../api/entities';
import ProfileFilters from '../components/ProfileFilters';
import ProfileDetailModal from '../components/ProfileDetailModal';
import FirstTimeGuideModal from '../components/FirstTimeGuideModal';

type Profile = any;

export default function Discovery() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
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
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<Profile | null>(null);
  const [isTabActive, setIsTabActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  

  const loadProfiles = useCallback(async (eventId: string, sessionId: string) => {
    try {
      const allVisibleProfiles = await EventProfile.filter({ event_id: eventId, is_visible: true });
      const userProfile = allVisibleProfiles.find((p: any) => p.session_id === sessionId);
      setCurrentUserProfile(userProfile);
      const otherUsersProfiles = allVisibleProfiles.filter((p: any) => p.session_id !== sessionId);
      setProfiles(otherUsersProfiles);
      if (!userProfile) {
        console.warn('Current user profile not found for session, redirecting.');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [navigation]);

  const applyFilters = () => {
    if (!currentUserProfile) {
      setFilteredProfiles([]);
      return;
    }
    const tempFiltered = profiles.filter((otherUser: any) => {
      const iAmInterestedInOther =
        currentUserProfile.interested_in === 'everyone' ||
        (currentUserProfile.interested_in === 'men' && otherUser.gender_identity === 'man') ||
        (currentUserProfile.interested_in === 'women' && otherUser.gender_identity === 'woman') ||
        (currentUserProfile.interested_in === 'non-binary' && otherUser.gender_identity === 'non-binary');
      const otherIsInterestedInMe =
        otherUser.interested_in === 'everyone' ||
        (otherUser.interested_in === 'men' && currentUserProfile.gender_identity === 'man') ||
        (otherUser.interested_in === 'women' && currentUserProfile.gender_identity === 'woman') ||
        (otherUser.interested_in === 'non-binary' && currentUserProfile.gender_identity === 'non-binary');
      if (!iAmInterestedInOther || !otherIsInterestedInMe) return false;
      if (!(otherUser.age >= filters.age_min && otherUser.age <= filters.age_max)) return false;
      if (filters.gender !== 'all' && otherUser.gender_identity !== filters.gender) return false;
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
      console.error('Error loading likes:', error);
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
      const events = await Event.filter({ id: eventId });
      if (events.length > 0) {
        setCurrentEvent(events[0]);
      } else {
        navigation.navigate('Home');
        return;
      }
      await Promise.all([loadProfiles(eventId, sessionId), loadLikes(eventId, sessionId)]);
    } catch (error) {
      console.error('Error initializing session:', error);
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


  const handleLike = async (likedProfile: any) => {
    if (likedProfiles.has(likedProfile.session_id) || !currentUserProfile) return;
    const eventId = await AsyncStorage.getItem('currentEventId');
    const likerSessionId = currentUserProfile.session_id;
    try {
      setLikedProfiles(prev => new Set([...Array.from(prev), likedProfile.session_id]));
      const newLike = await Like.create({
        event_id: eventId,
        liker_session_id: likerSessionId,
        liked_session_id: likedProfile.session_id,
        is_mutual: false,
        liker_notified_of_match: false,
        liked_notified_of_match: false,
      });
      const theirLikesToMe = await Like.filter({
        event_id: eventId,
        liker_session_id: likedProfile.session_id,
        liked_session_id: likerSessionId,
      });
      if (theirLikesToMe.length > 0) {
        const theirLikeRecord = theirLikesToMe[0];
        await Like.update(newLike.id, { is_mutual: true, liker_notified_of_match: true });
        await Like.update(theirLikeRecord.id, { is_mutual: true, liked_notified_of_match: true });
        alert(`🎉 It's a Match! You and ${likedProfile.first_name} liked each other.`);
        navigation.navigate('Matches');
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      setLikedProfiles(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(likedProfile.session_id);
        return newSet;
      });
    }
  };

  const handleProfileTap = (profile: any) => {
    setSelectedProfileForDetail(profile);
  };

  const handleCloseGuide = async () => {
    const eventId = await AsyncStorage.getItem('currentEventId');
    if (eventId) {
      await AsyncStorage.setItem(`hasSeenGuide_${eventId}`, 'true');
    }
    setShowGuide(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#9333ea" style={{ marginBottom: 8 }} />
        <Text style={[styles.loadingText, isDark && { color: '#d1d5db' }]}>Loading singles at this event...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
    <ScrollView contentContainerStyle={styles.container}>
      {showGuide && <FirstTimeGuideModal onClose={handleCloseGuide} />}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isDark && { color: '#ffffff' }]}>Singles at {currentEvent?.name}</Text>
          <Text style={[styles.subtitle, isDark && { color: '#d1d5db' }]}>{filteredProfiles.length} people discovered</Text>
        </View>
        <Button onPress={() => setShowFilters(true)} variant="outline" size="icon" style={styles.filterBtn}>
          <Filter size={20} color={isDark ? '#ffffff' : '#374151'} style={{}} />
        </Button>
      </View>

      {filteredProfiles.map(profile => (
        <TouchableOpacity key={profile.id} onPress={() => handleProfileTap(profile)} style={styles.cardWrapper}>
          <Card style={{ overflow: 'hidden' }}>
            <CardContent style={{ padding: 0 }}>
              <View style={styles.imageWrapper}>
                {profile.profile_photo_url && !imageErrors[profile.id] && (
                  <Image
                    source={{ uri: profile.profile_photo_url }}
                    style={styles.profileImage}
                    resizeMode="cover"
                    onError={() =>
                      setImageErrors(prev => ({ ...prev, [profile.id]: true }))
                    }
                  />
                )}
                {(!profile.profile_photo_url || imageErrors[profile.id]) && (
                  <View
                    style={[
                      styles.fallbackAvatar,
                      { backgroundColor: profile.profile_color || '#cccccc' },
                    ]}
                  >
                    <Text style={styles.fallbackText}>{profile.first_name[0]}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleLike(profile)}
                  disabled={likedProfiles.has(profile.session_id)}
                  style={[
                    styles.likeButton,
                    likedProfiles.has(profile.session_id) && styles.likeButtonDisabled,
                  ]}
                >
                  <Heart
                    size={16}
                    color={likedProfiles.has(profile.session_id) ? '#ec4899' : '#9ca3af'}
                    fill={likedProfiles.has(profile.session_id) ? '#ec4899' : 'none'}
                    style={{}}/>
                </TouchableOpacity>
                <View style={styles.nameOverlay}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {profile.first_name}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      ))}

      {filteredProfiles.length === 0 && !isLoading && (
        <Card style={styles.noProfilesCard}>
          <CardContent style={styles.noProfilesContent}>
            <Users size={48} color={isDark ? '#9ca3af' : '#9ca3af'} style={{ marginBottom: 16 }} />
            <Text style={[styles.noProfilesTitle, isDark && { color: '#ffffff' }]}>No singles found</Text>
            <Text style={[styles.noProfilesDesc, isDark && { color: '#d1d5db' }]}>
              Try adjusting your filters or check back later as more people join the event.
            </Text>
            <Button onPress={() => setShowFilters(true)} variant="outline" style={styles.adjustButton}>
              Adjust Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <ProfileFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
      {selectedProfileForDetail && (
        <ProfileDetailModal
          profile={selectedProfileForDetail}
          onClose={() => setSelectedProfileForDetail(null)}
          onLike={() => {
            handleLike(selectedProfileForDetail);
            setSelectedProfileForDetail(null);
          }}
          isLiked={likedProfiles.has(selectedProfileForDetail.session_id)}
        />
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  safeAreaDark: { backgroundColor: '#000000' },
  container: { paddingHorizontal: 16, paddingVertical: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280' },
  filterBtn: {},
  cardWrapper: { marginBottom: 16 },
  imageWrapper: { position: 'relative', width: '100%', aspectRatio: 1 },
  profileImage: { width: '100%', height: '100%' },
  fallbackAvatar: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#ffffff', fontWeight: '600', fontSize: 18 },
  likeButton: { position: 'absolute', top: 8, right: 8, padding: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)' },
  likeButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.9)' },
  nameOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)' },
  nameText: { color: '#ffffff', fontWeight: '600' },
  noProfilesCard: { marginTop: 32 },
  noProfilesContent: { alignItems: 'center' },
  noProfilesTitle: { fontWeight: '600', color: '#111827', marginBottom: 8 },
  noProfilesDesc: { color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  adjustButton: {},
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6b7280' },
});
