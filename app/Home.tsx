import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Hash, Heart, Shield, Clock, Users } from 'lucide-react-native';

import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Event } from '../api/entities';
import QRScanner from '../components/QRScanner';
import EventCodeEntry from '../components/EventCodeEntry';

export default function Home() {
  const navigation = useNavigation<any>();
  const [activeModal, setActiveModal] = useState<null | 'qrScanner' | 'manualCodeEntry'>(null);

  const checkActiveEventSession = useCallback(async () => {
    const eventId = await AsyncStorage.getItem('currentEventId');
    const sessionId = await AsyncStorage.getItem('currentSessionId');

    if (!eventId || !sessionId) return;

    try {
      const events = await Event.filter({ id: eventId });
      if (events.length > 0) {
        const event = events[0];
        const nowISO = new Date().toISOString();
        if (
          event.starts_at &&
          event.expires_at &&
          nowISO >= event.starts_at &&
          nowISO <= event.expires_at
        ) {
          navigation.navigate(createPageUrl('Discovery'));
          return;
        }
      }

      await AsyncStorage.multiRemove([
        'currentEventId',
        'currentSessionId',
        'currentEventCode',
        'currentProfileColor',
        'currentProfilePhotoUrl',
      ]);
    } catch (error) {
      console.error('Error checking active session:', error);
      await AsyncStorage.multiRemove([
        'currentEventId',
        'currentSessionId',
        'currentEventCode',
        'currentProfileColor',
        'currentProfilePhotoUrl',
      ]);
    }
  }, [navigation]);

  useEffect(() => {
    checkActiveEventSession();
  }, [checkActiveEventSession]);

  const handleScanSuccess = (scannedUrl: string) => {
    try {
      const url = new URL(scannedUrl);
      const eventCode = url.searchParams.get('code');
      if (eventCode) {
        closeModal();
        navigation.navigate(createPageUrl(`Join?code=${eventCode.toUpperCase()}`));
      } else {
        alert('Invalid QR code: No event code found in URL.');
      }
    } catch {
      if (typeof scannedUrl === 'string' && scannedUrl.trim().length > 3) {
        closeModal();
        navigation.navigate(createPageUrl(`Join?code=${scannedUrl.toUpperCase()}`));
      } else {
        alert('Invalid QR code format.');
      }
    }
  };

  const handleEventAccess = (eventCode: string) => {
    closeModal();
    navigation.navigate(createPageUrl(`Join?code=${eventCode.toUpperCase()}`));
  };

  const openModal = (name: 'qrScanner' | 'manualCodeEntry') => setActiveModal(name);
  const closeModal = () => setActiveModal(null);
  const switchToManualEntry = () => setActiveModal('manualCodeEntry');

  return (
    <LinearGradient colors={['#f8fafc', '#ffffff', '#eff6ff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <LinearGradient colors={['#ec4899', '#8b5cf6']} style={styles.heroIcon}>
            <Heart color="white" size={40} />
          </LinearGradient>
          <Text style={styles.title}>Meet Singles at</Text>
          <Text style={styles.titleHighlight}>This Event</Text>
          <Text style={styles.subtitle}>
            Connect with other singles privately and safely — only at this specific event
          </Text>
        </View>

        <View style={styles.accessMethods}>
          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.cardHeaderRow}>
                <LinearGradient colors={['#3b82f6', '#6366f1']} style={styles.cardIcon}>
                  <QrCode color="white" size={24} />
                </LinearGradient>
                <View>
                  <Text style={styles.cardTitle}>Scan QR Code</Text>
                  <Text style={styles.cardDescription}>Quick access with your camera</Text>
                </View>
              </View>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <Button onPress={() => openModal('qrScanner')} style={styles.primaryButton}>
                Scan QR Code
              </Button>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.cardHeaderRow}>
                <LinearGradient colors={['#8b5cf6', '#ec4899']} style={styles.cardIcon}>
                  <Hash color="white" size={24} />
                </LinearGradient>
                <View>
                  <Text style={styles.cardTitle}>Enter Event Code</Text>
                  <Text style={styles.cardDescription}>Manual entry option</Text>
                </View>
              </View>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <Button variant="outline" onPress={() => openModal('manualCodeEntry')} style={styles.secondaryButton}>
                Enter Code Manually
              </Button>
            </CardContent>
          </Card>
        </View>

        <View style={styles.features}>
          <View style={styles.featureBox}>
            <Shield color="#10b981" size={32} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Private</Text>
            <Text style={styles.featureDesc}>Your data stays secure</Text>
          </View>
          <View style={styles.featureBox}>
            <Clock color="#3b82f6" size={32} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Temporary</Text>
            <Text style={styles.featureDesc}>Expires after event</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <CardContent style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <Users color="#ec4899" size={20} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoTitle}>How it works</Text>
                <View style={styles.list}>
                  <Text style={styles.listItem}>• Scan the event's unique QR code</Text>
                  <Text style={styles.listItem}>• Create a temporary profile (first name only)</Text>
                  <Text style={styles.listItem}>• Discover other singles at this event</Text>
                  <Text style={styles.listItem}>• Match and chat privately</Text>
                  <Text style={styles.listItem}>• Everything expires when the event ends</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {activeModal === 'qrScanner' && (
          <QRScanner onScan={handleScanSuccess} onClose={closeModal} onSwitchToManual={switchToManualEntry} />
        )}
        {activeModal === 'manualCodeEntry' && (
          <EventCodeEntry onSubmit={handleEventAccess} onClose={closeModal} />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  titleHighlight: { fontSize: 24, fontWeight: 'bold', color: '#ec4899', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#6b7280', fontSize: 16 },
  accessMethods: { gap: 16, marginBottom: 32 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardHeader: { paddingBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '600', color: '#111827' },
  cardDescription: { fontSize: 12, color: '#6b7280' },
  cardContent: { paddingTop: 0 },
  primaryButton: { width: '100%', paddingVertical: 12 },
  secondaryButton: { width: '100%', paddingVertical: 12 },
  features: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  featureBox: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#ffffffcc' },
  featureIcon: { marginBottom: 8 },
  featureTitle: { fontWeight: '600', color: '#111827', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#6b7280' },
  infoCard: { borderRadius: 16, marginBottom: 32 },
  infoCardContent: { padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { marginTop: 4 },
  infoTitle: { fontWeight: '600', color: '#111827', marginBottom: 8 },
  list: { gap: 2 },
  listItem: { fontSize: 12, color: '#4b5563' },
});
