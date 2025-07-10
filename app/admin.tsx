
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Event, EventProfile, Like, Message, EventFeedback } from '../api/entities';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Copy,
  Download,
  Loader2,
  PlusCircle,
  BarChart2,
  Edit,
  Trash2,
  FileImage,
  MessageSquare,
  Hash,
  MapPin,
} from 'lucide-react-native';
import toast from '../lib/toast';
import { Toaster } from '../components/ui/sonner';
import QRCodeGenerator from '../components/QRCodeGenerator';
import EventFormModal from '../components/admin/EventFormModal';
import EventAnalyticsModal from '../components/admin/EventAnalyticsModal';
import DeleteConfirmationDialog from '../components/admin/DeleteConfirmationDialog';
import FeedbackInsightsModal from '../components/admin/FeedbackInsightsModal';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const APP_ORIGIN = 'https://example.com';

// --- CSV Helper Functions ---
interface CSVHeader { key: string; displayName: string }
interface EventEntity {
  id: string | number
  name: string
  code?: string
  location?: string
  starts_at?: string
  expires_at?: string
}

const convertToCSV = (dataArray: Record<string, any>[], headers: CSVHeader[]): string => {
  const headerRow = headers.map(h => h.displayName).join(',');
  const dataRows = dataArray.map(obj =>
    headers.map(header => {
      let value = obj[header.key];
      if (value === null || value === undefined) return '';
      if (Array.isArray(value)) value = value.join(';');
      const stringValue = String(value);
      // Escape double quotes by doubling them and wrap field in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
};

const downloadCSV = async (csvContent: string, fileName: string): Promise<void> => {
  const path = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path);
};

const downloadEventData = async (event: EventEntity): Promise<void> => {
  toast({ type: 'info', text1: `Preparing data export for "${event.name}"...` });
  let feedbackExported = false;
  let feedbackCount = 0;

  try {
    // Filter data specifically for this event
    const [profiles, likes, messages] = await Promise.all([
      EventProfile.filter({ event_id: event.id }),
      Like.filter({ event_id: event.id }),
      Message.filter({ event_id: event.id })
    ]);

    const safeEventName = event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '_');

    // Profiles CSV
    const profileHeaders = [
        { key: 'session_id', displayName: 'Session ID' },
        { key: 'first_name', displayName: 'First Name' },
        { key: 'age', displayName: 'Age' },
        { key: 'gender_identity', displayName: 'Gender Identity' },
        { key: 'interested_in', displayName: 'Interested In' },
        { key: 'interests', displayName: 'Interests' },
        { key: 'email', displayName: 'Email' },
        { key: 'is_visible', displayName: 'Is Visible' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(profiles, profileHeaders), `${safeEventName}_profiles_${timestamp}.csv`);

    // Small delay to prevent browser blocking multiple downloads
    await new Promise(resolve => setTimeout(resolve, 500));

    // Likes CSV
    const likeHeaders = [
        { key: 'liker_session_id', displayName: 'Liker Session ID' },
        { key: 'liked_session_id', displayName: 'Liked Session ID' },
        { key: 'is_mutual', displayName: 'Is Mutual Match' },
        { key: 'liker_notified_of_match', displayName: 'Liker Notified' },
        { key: 'liked_notified_of_match', displayName: 'Liked User Notified' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(likes, likeHeaders), `${safeEventName}_likes_${timestamp}.csv`);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Messages CSV
    const messageHeaders = [
        { key: 'sender_session_id', displayName: 'Sender Session ID' },
        { key: 'receiver_session_id', displayName: 'Receiver Session ID' },
        { key: 'content', displayName: 'Message Content' },
        { key: 'match_id', displayName: 'Match ID' },
        { key: 'is_read', displayName: 'Is Read' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(messages, messageHeaders), `${safeEventName}_messages_${timestamp}.csv`);

    // Optional: Feedback CSV
    try {
      const feedbacks = await EventFeedback.filter({ event_id: event.id });
      if (feedbacks && feedbacks.length > 0) {
        const feedbackHeaders = [
          { key: 'session_id', displayName: 'Session ID' },
          { key: 'rating_profile_setup', displayName: 'Rating: Profile Setup' },
          { key: 'rating_interests_helpful', displayName: 'Rating: Interests Helpful' },
          { key: 'rating_social_usefulness', displayName: 'Rating: Social Usefulness' },
          { key: 'met_match_in_person', displayName: 'Met Match In Person' },
          { key: 'open_to_other_event_types', displayName: 'Open to Other Event Types' },
          { key: 'match_experience_feedback', displayName: 'Match Experience Feedback' },
          { key: 'general_feedback', displayName: 'General Feedback' },
          { key: 'created_date', displayName: 'Created Date' },
        ];
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before next download
        downloadCSV(convertToCSV(feedbacks, feedbackHeaders), `${safeEventName}_feedbacks_${timestamp}.csv`);
        feedbackExported = true;
        feedbackCount = feedbacks.length;
      }
    } catch (feedbackError) {
      console.warn(`Error downloading feedback data for event ${event.id}:`, feedbackError);
      // Do not re-throw, allow main download to complete if other parts succeeded
    }

    let successMessage = `Successfully downloaded ${profiles.length} profiles, ${likes.length} likes, and ${messages.length} messages for "${event.name}".`;
    if (feedbackExported) {
      successMessage += ` (${feedbackCount} feedback responses also exported).`;
    } else {
      successMessage += ` (No feedback data found or feedback export skipped).`;
    }
      toast({ type: 'success', text1: successMessage });

  } catch (error) {
    console.error(`Error downloading data for event ${event.id}:`, error);
      toast({ type: 'error', text1: 'Failed to download event data. Please try again.' });
  }
};
// --- End Helper Functions ---

const ADMIN_PASSCODE = "HOOKEDADMIN24";

// Helper to construct relative page URLs, ensuring a leading slash
const createPageUrl = (path: string): string =>
  `/${path.startsWith('/') ? path.substring(1) : path}`;

const AdminDashboard: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingEventId, setDownloadingEventId] = useState<string | number | null>(null);

  const [modals, setModals] = useState<Record<'form' | 'analytics' | 'delete' | 'feedbacks', boolean>>({
    form: false,
    analytics: false,
    delete: false,
    feedbacks: false,
  });
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const eventList = await Event.list('-created_date');
      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({ type: 'error', text1: 'Failed to load events.' });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, loadEvents]);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      toast({ type: 'success', text1: 'Authentication successful!' });
    } else {
      toast({ type: 'error', text1: 'Incorrect passcode.' });
    }
  };

  const openModal = (
    modalName: 'form' | 'analytics' | 'delete' | 'feedbacks',
    event: EventEntity | null = null
  ) => {
    setSelectedEvent(event);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = () => {
    setModals({ form: false, analytics: false, delete: false, feedbacks: false });
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await Event.delete(selectedEvent.id);
      toast({ type: 'success', text1: `Event "${selectedEvent.name}" deleted successfully.` });
      closeModal();
      loadEvents();
    } catch (error) {
      toast({ type: 'error', text1: 'Failed to delete event. See console for details.' });
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (event: EventEntity): Promise<void> => {
    setDownloadingEventId(event.id);
    try {
      await downloadEventData(event);
    } finally {
      setDownloadingEventId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, styles.authContainer]}>
        <Toaster position="top" />
        <Card style={styles.authCard}>
          <CardHeader>
            <CardTitle>
              <Text style={styles.authTitle}>Admin Access</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Passcode"
              style={styles.input}
            />
            <Button onPress={handlePasswordSubmit} style={styles.authButton}>
              Authenticate
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toaster position="bottom" />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Event Management</Text>
          <Text style={styles.subtitle}>Create and manage Hooked events</Text>
        </View>
        <Button onPress={() => openModal('form')} style={styles.createButton}>
          <PlusCircle size={16} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Create Event</Text>
        </Button>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#6366f1" />
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events yet</Text>
          <Button onPress={() => openModal('form')} style={styles.createButton}>
            <PlusCircle size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Create Your First Event</Text>
          </Button>
        </View>
      ) : (
        events.map(event => {
          const now = new Date();
          const isActive =
            !!event.starts_at &&
            !!event.expires_at &&
            new Date(event.starts_at) <= now &&
            now <= new Date(event.expires_at);
          return (
            <Card key={event.id} style={styles.eventCard}>
              <CardHeader style={styles.eventHeader}>
                <View style={styles.headerContent}>
                  <View style={{ flex: 1 }}>
                    <CardTitle>
                      <Text style={styles.eventName}>{event.name}</Text>
                    </CardTitle>
                    <View style={styles.codeRow}>
                      <View style={styles.codeItem}>
                        <Hash size={14} color="#fff" />
                        <Text style={styles.codeText}>{event.code?.toUpperCase() || 'No Code'}</Text>
                      </View>
                      {event.location ? (
                        <View style={styles.codeItem}>
                          <MapPin size={14} color="#fff" />
                          <Text style={styles.codeText}>{event.location}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Badge style={isActive ? styles.activeBadge : styles.inactiveBadge}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </View>
              </CardHeader>
              <CardContent>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Schedule</Text>
                  <Text style={styles.sectionText}>
                    Starts: {event.starts_at ? new Date(event.starts_at).toLocaleString() : 'Not set'}
                  </Text>
                  <Text style={styles.sectionText}>
                    Expires: {new Date(event.expires_at).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Join Link</Text>
                  <View style={styles.linkRow}>
                    <Input
                      value={`${APP_ORIGIN}${createPageUrl(`join?code=${event.code?.toUpperCase() || ''}`)}`}
                      editable={false}
                      style={styles.linkInput}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => {
                        Clipboard.setStringAsync(
                          `${APP_ORIGIN}${createPageUrl(`join?code=${event.code?.toUpperCase() || ''}`)}`
                        );
                        toast({ type: 'success', text1: 'Join link copied to clipboard!' });
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  </View>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>QR Code</Text>
                  <QRCodeGenerator
                    url={`${APP_ORIGIN}${createPageUrl(`join?code=${event.code?.toUpperCase() || ''}`)}`}
                    fileName={`${event.name}_QR.png`}
                  />
                </View>
              </CardContent>
              <CardFooter style={styles.footer}>
                <Button variant="outline" onPress={() => openModal('analytics', event)} style={styles.actionButton}>
                  <BarChart2 size={14} style={styles.icon} />
                  <Text style={styles.actionText}>Analytics</Text>
                </Button>
                <Button variant="outline" onPress={() => openModal('feedbacks', event)} style={styles.actionButton}>
                  <MessageSquare size={14} style={styles.icon} />
                  <Text style={styles.actionText}>Feedbacks</Text>
                </Button>
                <Button variant="outline" onPress={() => openModal('form', event)} style={styles.actionButton}>
                  <Edit size={14} style={styles.icon} />
                  <Text style={styles.actionText}>Edit</Text>
                </Button>
                <Button onPress={() => handleDownload(event)} disabled={downloadingEventId === event.id} style={styles.actionButton}>
                  {downloadingEventId === event.id ? (
                    <Loader2 size={14} style={styles.icon} />
                  ) : (
                    <Download size={14} style={styles.icon} />
                  )}
                  <Text style={styles.actionText}>Download</Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={() => toast({ type: 'info', text1: 'Coming soon!' })}
                  style={styles.actionButton}
                >
                  <FileImage size={14} style={styles.icon} />
                  <Text style={styles.actionText}>QR Sign</Text>
                </Button>
                <Button variant="destructive" onPress={() => openModal('delete', event)} style={styles.actionButton}>
                  <Trash2 size={14} style={styles.icon} />
                  <Text style={styles.actionText}>Delete</Text>
                </Button>
              </CardFooter>
            </Card>
          );
        })
      )}

      {modals.form && (
        <EventFormModal
          event={selectedEvent}
          isOpen
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            loadEvents();
          }}
        />
      )}
      {modals.analytics && selectedEvent && (
        <EventAnalyticsModal event={selectedEvent} isOpen onClose={closeModal} />
      )}
      {modals.feedbacks && selectedEvent && (
        <FeedbackInsightsModal event={selectedEvent} isOpen onClose={closeModal} />
      )}
      {modals.delete && selectedEvent && (
        <DeleteConfirmationDialog
          isOpen
          onClose={closeModal}
          onConfirm={handleDeleteEvent}
          eventName={selectedEvent.name}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4 },
  buttonText: { color: '#fff' },
  loading: { marginTop: 32 },
  emptyState: { alignItems: 'center', marginTop: 32 },
  emptyText: { marginBottom: 12, fontSize: 16, color: '#111827' },
  eventCard: { marginBottom: 16 },
  eventHeader: { backgroundColor: '#3b82f6', padding: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start' },
  eventName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  codeRow: { flexDirection: 'row', gap: 8 },
  codeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  codeText: { color: '#e0e7ff', fontSize: 12 },
  activeBadge: { backgroundColor: '#10b981', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inactiveBadge: { backgroundColor: '#6b7280', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: '600', marginBottom: 4, color: '#111827' },
  sectionText: { fontSize: 12, color: '#6b7280' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkInput: { flex: 1 },
  footer: { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 4, color: '#111827' },
  icon: { marginRight: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { backgroundColor: '#f3f4f6', padding: 16, flex: 1 },
  authCard: { width: '100%', maxWidth: 400 },
  authTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  input: { marginBottom: 12 },
  authButton: { paddingVertical: 12 },
});

export default AdminDashboard;
