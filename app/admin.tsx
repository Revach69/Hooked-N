
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Event } from '../api/entities';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { PlusCircle } from 'lucide-react-native';
import toast from '../lib/toast';
import { Toaster } from '../components/ui/sonner';
import EventFormModal from '../components/admin/EventFormModal';
import EventAnalyticsModal from '../components/admin/EventAnalyticsModal';
import DeleteConfirmationDialog from '../components/admin/DeleteConfirmationDialog';
import FeedbackInsightsModal from '../components/admin/FeedbackInsightsModal';
import AdminEventCard from '../components/admin/AdminEventCard';
import { downloadEventData } from '../utils/csvExport';

interface EventEntity {
  id: string | number
  name: string
  code?: string
  location?: string
  starts_at?: string
  expires_at?: string
}

const ADMIN_PASSCODE = "HOOKEDADMIN24";
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
      const eventList = await Event.list();
      const mappedList: EventEntity[] = eventList.map((e: any) => ({
        id: e.id,
        name: e.name ?? '',
        code: e.code,
        location: e.location,
        starts_at: e.starts_at,
        expires_at: e.expires_at,
      }));
      setEvents(mappedList);
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
      await Event.delete(String(selectedEvent.id));
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
        events.map(event => (
          <AdminEventCard
            key={event.id}
            event={event}
            isDownloading={downloadingEventId === event.id}
            onAnalytics={(event) => openModal('analytics', event)}
            onFeedbacks={(event) => openModal('feedbacks', event)}
            onEdit={(event) => openModal('form', event)}
            onDownload={handleDownload}
            onDelete={(event) => openModal('delete', event)}
          />
        ))
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { backgroundColor: '#f3f4f6', padding: 16, flex: 1 },
  authCard: { width: '100%', maxWidth: 400 },
  authTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  input: { marginBottom: 12 },
  authButton: { paddingVertical: 12 },
  icon: { marginRight: 2 },
});

export default AdminDashboard;
