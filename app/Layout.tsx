import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, Users, User } from 'lucide-react-native';
import { Toaster } from '../components/ui/sonner';
import {
  Event,
  EventProfile,
  Like,
  Message,
} from '../api/entities';
import MatchNotificationToast from '../components/MatchNotificationToast';
import MessageNotificationToast from '../components/MessageNotificationToast';
import FeedbackSurveyModal from '../components/FeedbackSurveyModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation = useNavigation();

  const [isInActiveEvent, setIsInActiveEvent] = useState(false);
  const [hasUnseenMatches, setHasUnseenMatches] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [showMessageToast, setShowMessageToast] = useState(false);
  const [newMatchDetails, setNewMatchDetails] = useState<{ name: string; profileId: string }>({ name: '', profileId: '' });
  const [newMessageDetails, setNewMessageDetails] = useState<{ name: string; senderSessionId: string }>({ name: '', senderSessionId: '' });
  const [notifiedMatchIdsThisSession, setNotifiedMatchIdsThisSession] = useState<Set<string>>(new Set());
  const [notifiedMessageIdsThisSession, setNotifiedMessageIdsThisSession] = useState<Set<string>>(new Set());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEvent, setFeedbackEvent] = useState<any>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);

  const getItem = async (key: string) => {
    return (await AsyncStorage.getItem(key)) || null;
  };
  const setItem = async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  };
  const removeItem = async (key: string) => {
    await AsyncStorage.removeItem(key);
  };

  const checkForFeedbackEligibility = useCallback(async () => {
    try {
      const lastEventId = (await getItem('currentEventId')) || (await getItem('last_event_id'));
      const lastSessionId = (await getItem('currentSessionId')) || (await getItem('last_session_id'));

      if (!lastEventId || !lastSessionId) return;

      const feedbackGiven = await getItem(`feedback_given_for_${lastEventId}`);
      if (feedbackGiven) return;

      const events = await Event.filter({ id: lastEventId });
      if (events.length === 0) return;

      const event = events[0];
      const nowISO = new Date().toISOString();

      if (event.expires_at && nowISO > event.expires_at) {
        setFeedbackEvent(event);
        setFeedbackSessionId(lastSessionId);
        setShowFeedbackModal(true);
        await setItem('last_event_id', lastEventId);
        await setItem('last_session_id', lastSessionId);
      }
    } catch (err) {
      console.error('Error checking feedback eligibility:', err);
    }
  }, []);

  useEffect(() => {
    checkForFeedbackEligibility();
  }, [checkForFeedbackEligibility]);

  const handleLogoClick = useCallback(async () => {
    const eventId = await getItem('currentEventId');
    const sessionId = await getItem('currentSessionId');

    if (!eventId || !sessionId) {
      navigation.navigate('Home' as never);
      checkForFeedbackEligibility();
      return;
    }

    try {
      const events = await Event.filter({ id: eventId });
      if (events.length > 0) {
        const event = events[0];
        const nowISO = new Date().toISOString();
        if (event.starts_at && event.expires_at && nowISO >= event.starts_at && nowISO <= event.expires_at) {
          navigation.navigate('Discovery' as never);
          return;
        }
      }
      if (eventId && sessionId) {
        await setItem('last_event_id', eventId);
        await setItem('last_session_id', sessionId);
      }
      await removeItem('currentEventId');
      await removeItem('currentSessionId');
      await removeItem('currentEventCode');
      await removeItem('currentProfileColor');
      await removeItem('currentProfilePhotoUrl');
      navigation.navigate('Home' as never);
      checkForFeedbackEligibility();
    } catch (err) {
      console.error('Error checking event status:', err);
      if (eventId && sessionId) {
        await setItem('last_event_id', eventId);
        await setItem('last_session_id', sessionId);
      }
      await removeItem('currentEventId');
      await removeItem('currentSessionId');
      await removeItem('currentEventCode');
      await removeItem('currentProfileColor');
      await removeItem('currentProfilePhotoUrl');
      navigation.navigate('Home' as never);
      checkForFeedbackEligibility();
    }
  }, [navigation, checkForFeedbackEligibility]);

  const checkNotifications = useCallback(async () => {
    const eventId = await getItem('currentEventId');
    const currentSessionId = await getItem('currentSessionId');

    const currentlyActive = !!(eventId && currentSessionId);
    setIsInActiveEvent(currentlyActive);

    if (!currentlyActive) {
      setHasUnseenMatches(false);
      setHasUnreadMessages(false);
      setShowMatchToast(false);
      setShowMessageToast(false);
      setNotifiedMatchIdsThisSession(new Set());
      setNotifiedMessageIdsThisSession(new Set());
      return;
    }

    try {
      const userOutgoingLikes = await Like.filter({ liker_session_id: currentSessionId, event_id: eventId, is_mutual: true });
      const userIncomingLikes = await Like.filter({ liked_session_id: currentSessionId, event_id: eventId, is_mutual: true });

      let unseenMatchFound = false;
      let potentialToastMatch: any = null;

      [...userOutgoingLikes, ...userIncomingLikes].forEach((like: any) => {
        const isLiker = like.liker_session_id === currentSessionId;
        if ((isLiker && !like.liker_notified_of_match) || (!isLiker && !like.liked_notified_of_match)) {
          unseenMatchFound = true;
          if (!potentialToastMatch && !notifiedMatchIdsThisSession.has(like.id)) {
            potentialToastMatch = {
              ...like,
              otherUserSessionId: isLiker ? like.liked_session_id : like.liker_session_id,
              type: isLiker ? 'liker' : 'liked',
            };
          }
        }
      });

      setHasUnseenMatches(unseenMatchFound);

      if (potentialToastMatch && !showMatchToast) {
        const profile = await EventProfile.filter({ session_id: potentialToastMatch.otherUserSessionId, event_id: eventId });
        if (profile.length > 0) {
          setNewMatchDetails({ name: profile[0].first_name, profileId: profile[0].id });
          setShowMatchToast(true);
          setNotifiedMatchIdsThisSession(prev => new Set([...prev, potentialToastMatch.id]));
          const updatePayload: any = {};
          if (potentialToastMatch.type === 'liker') {
            updatePayload.liker_notified_of_match = true;
          } else {
            updatePayload.liked_notified_of_match = true;
          }
          await Like.update(potentialToastMatch.id, updatePayload);
        }
      }

      const unreadMessages = await Message.filter({
        receiver_session_id: currentSessionId,
        event_id: eventId,
        is_read: false,
      });

      setHasUnreadMessages(unreadMessages.length > 0);

      if (unreadMessages.length > 0 && !showMessageToast) {
        const latestUnreadMessage = unreadMessages.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0];
        if (!notifiedMessageIdsThisSession.has(latestUnreadMessage.id)) {
          const senderProfile = await EventProfile.filter({ session_id: latestUnreadMessage.sender_session_id, event_id: eventId });
          if (senderProfile.length > 0) {
            setNewMessageDetails({ name: senderProfile[0].first_name, senderSessionId: latestUnreadMessage.sender_session_id });
            setShowMessageToast(true);
            setNotifiedMessageIdsThisSession(prev => new Set([...prev, latestUnreadMessage.id]));
          }
        }
      }
    } catch (err) {
      console.error('Error checking notifications:', err);
    }
  }, [notifiedMatchIdsThisSession, showMatchToast, notifiedMessageIdsThisSession, showMessageToast]);

  const handleIconClick = (targetPage: string) => {
    navigation.navigate(targetPage as never);
  };

  useEffect(() => {
    checkNotifications();
    const intervalId = setInterval(checkNotifications, 45000);
    return () => clearInterval(intervalId);
  }, [checkNotifications]);

  const shouldShowInstagramFooter = ['Home', 'Discovery', 'Matches'].includes(currentPageName || '');

  const handleInstagramClick = () => {
    Linking.openURL('https://instagram.com/joinhooked');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogoClick} style={styles.logoButton}>
          <View style={styles.logoCircle}>
            <Heart size={16} color="#fff" />
          </View>
          <Text style={[styles.logoText, { color: isDark ? '#fff' : '#000' }]}>Hooked</Text>
        </TouchableOpacity>
        {currentPageName !== 'Home' && isInActiveEvent && (
          <View style={styles.navIcons}>
            <TouchableOpacity onPress={() => handleIconClick('Profile')} style={styles.iconButton}>
              <User size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleIconClick('Matches')} style={styles.iconButton}>
              <Users size={20} color={isDark ? '#fff' : '#000'} />
              {(hasUnseenMatches || hasUnreadMessages) && <View style={styles.redDot} />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>{children}</View>

      {shouldShowInstagramFooter && (
        <TouchableOpacity onPress={handleInstagramClick} style={styles.instagramButton}>
          <Text style={[styles.instagramText, { color: isDark ? '#ccc' : '#555' }]}>Follow us on IG @joinhooked</Text>
        </TouchableOpacity>
      )}

      <MatchNotificationToast
        visible={showMatchToast}
        matchName={newMatchDetails.name}
        onDismiss={() => setShowMatchToast(false)}
        onSeeMatches={() => {
          setShowMatchToast(false);
          navigation.navigate('Matches' as never);
        }}
      />

      <MessageNotificationToast
        visible={showMessageToast}
        senderName={newMessageDetails.name}
        onDismiss={() => setShowMessageToast(false)}
        onView={() => {
          setShowMessageToast(false);
          navigation.navigate('Matches' as never, { openChat: newMessageDetails.senderSessionId } as never);
        }}
      />

      {showFeedbackModal && feedbackEvent && feedbackSessionId && (
        <FeedbackSurveyModal event={feedbackEvent} sessionId={feedbackSessionId} onClose={() => setShowFeedbackModal(false)} />
      )}

      <View style={styles.privacyNotice}>
        <View style={styles.privacyInner}> 
          <User size={16} color={isDark ? '#4ade80' : '#16a34a'} />
          <Text style={[styles.privacyTitle, { color: isDark ? '#e5e5e5' : '#374151' }]}>Privacy Protected</Text>
        </View>
        <Text style={[styles.privacyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Your data automatically expires when this event ends. No permanent profiles, no data sharing between events.</Text>
      </View>

      <Toaster />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  safeAreaDark: { backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoButton: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ec4899', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  logoText: { fontWeight: '600', fontSize: 18 },
  navIcons: { flexDirection: 'row' },
  iconButton: { padding: 8, marginLeft: 8 },
  redDot: { position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  content: { flex: 1 },
  instagramButton: { paddingVertical: 12, alignItems: 'center' },
  instagramText: { fontSize: 14 },
  privacyNotice: { marginTop: 24, paddingBottom: 16, alignItems: 'center' },
  privacyInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  privacyTitle: { fontSize: 14, fontWeight: '500', marginLeft: 4 },
  privacyText: { fontSize: 12, textAlign: 'center', maxWidth: 320 },
});
