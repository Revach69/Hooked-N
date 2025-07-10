import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { EventProfile, Like, Message } from '../../api/entities';
import { X } from 'lucide-react-native';

interface EventData {
  id: string | number;
  name: string;
}

interface Analytics {
  profiles: any[];
  likes: any[];
  messages: any[];
  stats: {
    totalProfiles: number;
    totalLikes: number;
    mutualMatches: number;
    totalMessages: number;
    averageAge: number;
  };
}

export interface EventAnalyticsModalProps {
  event: EventData;
  isOpen: boolean;
  onClose: () => void;
}

const EventAnalyticsModal: React.FC<EventAnalyticsModalProps> = ({ event, isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<Analytics>({
    profiles: [],
    likes: [],
    messages: [],
    stats: {
      totalProfiles: 0,
      totalLikes: 0,
      mutualMatches: 0,
      totalMessages: 0,
      averageAge: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, likes, messages] = await Promise.all([
        EventProfile.filter({ event_id: event.id }),
        Like.filter({ event_id: event.id }),
        Message.filter({ event_id: event.id }),
      ]);

      const totalProfiles = profiles.length;
      const totalLikes = likes.length;
      const mutualMatches = likes.filter(l => l.is_mutual).length / 2;
      const totalMessages = messages.length;

      const ages = profiles.filter(p => p.age).map(p => p.age);
      const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

      setAnalytics({
        profiles,
        likes,
        messages,
        stats: { totalProfiles, totalLikes, mutualMatches, totalMessages, averageAge },
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
    setIsLoading(false);
  }, [event.id]);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, loadAnalytics]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <View style={styles.headerRow}>
            <DialogTitle style={styles.title}>Analytics: {event.name}</DialogTitle>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <X size={16} />
            </Button>
          </View>
        </DialogHeader>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <ScrollView style={styles.body}>
            <Text>Total Profiles: {analytics.stats.totalProfiles}</Text>
            <Text>Total Likes: {analytics.stats.totalLikes}</Text>
            <Text>Mutual Matches: {analytics.stats.mutualMatches}</Text>
            <Text>Total Messages: {analytics.stats.totalMessages}</Text>
            <Text>Average Age: {analytics.stats.averageAge}</Text>
          </ScrollView>
        )}
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  content: { maxHeight: '90%', width: '100%' },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  body: { padding: 16 },
});

export default EventAnalyticsModal;
