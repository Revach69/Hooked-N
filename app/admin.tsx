
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
<<<<<<< HEAD
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { createPageUrl } from '../utils';
=======
import AdminEventCard from '../components/admin/AdminEventCard';
import { downloadEventData } from '../utils/csvExport';
>>>>>>> 953708c96ef6745e7ca79ba67007fb824bfdca4b

interface EventEntity {
  id: string | number
  name: string
  code?: string
  location?: string
  starts_at?: string
  expires_at?: string
}

const ADMIN_PASSCODE = "HOOKEDADMIN24";

<<<<<<< HEAD


=======
>>>>>>> 953708c96ef6745e7ca79ba67007fb824bfdca4b
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
<<<<<<< HEAD
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
                    Expires: {event.expires_at ? new Date(event.expires_at).toLocaleString() : 'Not set'}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Join Link</Text>
                  <View style={styles.linkRow}>
                    <Input
                      value={`${APP_ORIGIN}${createPageUrl(`Join?code=${event.code?.toUpperCase() || ''}`)}`}
                      editable={false}
                      style={styles.linkInput}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => {
                        Clipboard.setStringAsync(
                          `${APP_ORIGIN}${createPageUrl(`Join?code=${event.code?.toUpperCase() || ''}`)}`
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
                    url={`${APP_ORIGIN}${createPageUrl(`Join?code=${event.code?.toUpperCase() || ''}`)}`}
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
=======
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
>>>>>>> 953708c96ef6745e7ca79ba67007fb824bfdca4b
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
