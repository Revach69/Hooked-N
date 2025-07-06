import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal, View, Text, ScrollView, Image, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, X, Clock, Share, Phone, User } from 'lucide-react-native';
import { Message, ContactShare } from '../api/entities';
import ContactShareModal from './ContactShareModal';
import { format } from 'date-fns';

interface Props {
  match: any;
  onClose: () => void;
}

export default function ChatModal({ match, onClose }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showContactShare, setShowContactShare] = useState(false);
  const [hasSharedContact, setHasSharedContact] = useState(false);
  const [receivedContactInfo, setReceivedContactInfo] = useState<any>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const matchId = useMemo(() => {
    if (!sessionId) return null;
    return `${sessionId}_${match.session_id}`.split('').sort().join('');
  }, [sessionId, match.session_id]);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem('currentSessionId');
      const eid = await AsyncStorage.getItem('currentEventId');
      setSessionId(sid);
      setEventId(eid);
    })();
  }, []);

  useEffect(() => {
    setProfileImageError(false);
  }, [match.session_id]);

  const markMessagesAsRead = useCallback(async () => {
    if (!matchId || !sessionId || !eventId) return;
    try {
      const unread = await Message.filter({
        match_id: matchId,
        receiver_session_id: sessionId,
        is_read: false,
        event_id: eventId,
      });
      if (unread.length > 0) {
        await Promise.all(unread.map(u => Message.update(u.id, { is_read: true })));
      }
    } catch (e) {
      console.error('Error marking messages as read:', e);
    }
  }, [matchId, sessionId, eventId]);
  const loadMessages = useCallback(async () => {
    if (!eventId || !matchId) return;
    try {
      const all = await Message.filter({ event_id: eventId, match_id: matchId }, 'created_date');
      setMessages(all);
      markMessagesAsRead();
    } catch (e) {
      console.error('Error loading messages:', e);
    }
    setIsLoading(false);
  }, [eventId, matchId, markMessagesAsRead]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => setIsTabActive(s === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!sessionId || !eventId || !matchId) return;
    loadMessages();
    loadContactShares();
    const interval = setInterval(() => {
      if (isTabActive) {
        loadMessages();
        loadContactShares();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionId, eventId, matchId, isTabActive, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadContactShares = async () => {
    if (!eventId || !matchId || !sessionId) return;
    try {
      const mine = await ContactShare.filter({ event_id: eventId, match_id: matchId, sharer_session_id: sessionId });
      if (mine.length > 0) setHasSharedContact(true);
      const theirs = await ContactShare.filter({
        event_id: eventId,
        match_id: matchId,
        sharer_session_id: match.session_id,
        recipient_session_id: sessionId,
      });
      if (theirs.length > 0) setReceivedContactInfo(theirs[0]);
    } catch (e) {
      console.error('Error loading contact shares:', e);
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!sessionId || !eventId || !matchId) return;
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const temp = {
        id: `temp_${Date.now()}`,
        content,
        sender_session_id: sessionId,
        created_date: new Date().toISOString(),
      };
      setMessages(prev => [...prev, temp]);
      await Message.create({
        event_id: eventId,
        sender_session_id: sessionId,
        receiver_session_id: match.session_id,
        content,
        match_id: matchId,
        is_read: false,
      });
    } catch (e) {
      console.error('Error sending message:', e);
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp_')));
      setNewMessage(content);
    }
  };

  const handleShareContact = async (info: { fullName: string; phoneNumber: string }) => {
    if (!eventId || !sessionId || !matchId) return;
    try {
      await ContactShare.create({
        event_id: eventId,
        sharer_session_id: sessionId,
        recipient_session_id: match.session_id,
        full_name: info.fullName,
        phone_number: info.phoneNumber,
        match_id: matchId,
      });
      setHasSharedContact(true);
      setShowContactShare(false);
      loadContactShares();
    } catch (e) {
      console.error('Error sharing contact info:', e);
      throw e;
    }
  };
  return (
    <Modal visible onRequestClose={onClose} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {match.profile_photo_url && !profileImageError ? (
                <Image source={{ uri: match.profile_photo_url }} style={styles.avatar} onError={() => setProfileImageError(true)} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: match.profile_color }]}> 
                  <Text style={styles.avatarFallbackText}>{match.first_name[0]}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{match.first_name}</Text>
                <View style={styles.expiryRow}>
                  <Clock size={12} color="#9ca3af" />
                  <Text style={styles.expiryText}>Expires at midnight</Text>
                </View>
              </View>
              {!hasSharedContact && (
                <Button variant="ghost" size="icon" onPress={() => setShowContactShare(true)} accessibilityLabel="Share contact info">
                  <Share size={16} color="#6b7280" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onPress={onClose} accessibilityLabel="Close chat">
                <X size={16} color="#6b7280" />
              </Button>
            </View>
            <View style={styles.interestsWrap}>
              {match.interests?.map((int: string) => (
                <Badge key={int} variant="outline" style={styles.interestBadge}>{int}</Badge>
              ))}
            </View>
            {(hasSharedContact || receivedContactInfo) && (
              <View style={{ marginTop: 8 }}>
                {hasSharedContact && (
                  <View style={styles.infoRow}>
                    <Share size={12} color="#16a34a" />
                    <Text style={styles.infoText}>You shared your contact info</Text>
                  </View>
                )}
                {receivedContactInfo && (
                  <View style={styles.contactBox}>
                    <View style={styles.contactBoxHeader}>
                      <Phone size={12} color="#2563eb" />
                      <Text style={styles.contactBoxHeaderText}>{match.first_name} shared their contact info</Text>
                    </View>
                    <View>
                      <View style={styles.contactItem}>
                        <User size={12} color="#6b7280" />
                        <Text style={styles.contactText}>{receivedContactInfo.full_name}</Text>
                      </View>
                      <View style={styles.contactItem}>
                        <Phone size={12} color="#6b7280" />
                        <Text style={styles.contactText}>{receivedContactInfo.phone_number}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 16 }}>
            {isLoading ? (
              <View style={styles.loading}><Text>Loading...</Text></View>
            ) : messages.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyText}>🎉 You matched! Say hello to {match.first_name}</Text></View>
            ) : (
              messages.map(m => (
                <View key={m.id} style={[styles.messageRow, m.sender_session_id === sessionId ? styles.messageRowSelf : styles.messageRowOther]}>
                  <View style={[styles.messageBubble, m.sender_session_id === sessionId ? styles.messageBubbleSelf : styles.messageBubbleOther]}>
                    <Text style={styles.messageText}>{m.content}</Text>
                    <Text style={[styles.timeText, m.sender_session_id === sessionId ? styles.timeTextSelf : styles.timeTextOther]}>{format(new Date(m.created_date), 'HH:mm')}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.inputRow}>
            <Input
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={`Message ${match.first_name}...`}
              style={styles.textInput}
            />
            <Button disabled={!newMessage.trim()} onPress={sendMessage} size="icon" style={styles.sendBtn}>
              <Send size={16} color="#fff" />
            </Button>
          </View>
          {showContactShare && (
            <ContactShareModal
              matchName={match.first_name}
              onConfirm={handleShareContact}
              onCancel={() => setShowContactShare(false)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', maxHeight: '90%' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerRow: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e9d5ff' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#fff', fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', columnGap: 4, marginTop: 2 },
  expiryText: { fontSize: 12, color: '#6b7280' },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, rowGap: 4, columnGap: 4 },
  interestBadge: { fontSize: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e9d5ff', color: '#7c3aed', backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', columnGap: 4, marginTop: 4 },
  infoText: { fontSize: 12, color: '#16a34a' },
  contactBox: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 8, marginTop: 4 },
  contactBoxHeader: { flexDirection: 'row', alignItems: 'center', columnGap: 4, marginBottom: 4 },
  contactBoxHeaderText: { fontSize: 12, color: '#2563eb' },
  contactItem: { flexDirection: 'row', alignItems: 'center', columnGap: 4, marginBottom: 2 },
  contactText: { fontSize: 14, color: '#111' },
  messages: { flex: 1, backgroundColor: '#f9fafb' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: '#6b7280' },
  messageRow: { marginBottom: 8, flexDirection: 'row' },
  messageRowSelf: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  messageBubbleSelf: { backgroundColor: '#a855f7' },
  messageBubbleOther: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' },
  messageText: { color: '#111' },
  timeText: { fontSize: 10, marginTop: 4 },
  timeTextSelf: { color: '#f3e8ff' },
  timeTextOther: { color: '#6b7280' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb' },
  textInput: { flex: 1, borderRadius: 9999, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { backgroundColor: '#a855f7', borderRadius: 9999, marginLeft: 8 },
});
