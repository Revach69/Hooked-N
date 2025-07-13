import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { EventFeedback } from '../../api/entities';
import { X } from 'lucide-react-native';
import { EventFeedback as EventFeedbackType } from '../../types';
import { errorHandler } from '../../utils/errorHandler';

interface EventData {
  id: string | number;
  name: string;
}

export interface FeedbackInsightsModalProps {
  event: EventData;
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackInsightsModal: React.FC<FeedbackInsightsModalProps> = ({ event, isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<EventFeedbackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await EventFeedback.filter({ event_id: event.id });
      setFeedbacks(list as EventFeedbackType[]);
    } catch (err) {
      errorHandler.handleError(err, 'FeedbackInsightsModal:loadFeedbacks', 'Error loading feedbacks');
    }
    setIsLoading(false);
  }, [event.id]);

  useEffect(() => {
    if (isOpen) {
      loadFeedbacks();
    }
  }, [isOpen, loadFeedbacks]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <View style={styles.headerRow}>
            <DialogTitle style={styles.title}>Feedback: {event.name}</DialogTitle>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <X size={16} />
            </Button>
          </View>
        </DialogHeader>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <ScrollView style={styles.body}>
            {feedbacks.length === 0 ? (
              <Text>No feedback yet.</Text>
            ) : (
              feedbacks.map((fb, idx) => (
                <View key={idx} style={styles.item}>
                  <Text>{fb.generalFeedback || 'No comments'}</Text>
                </View>
              ))
            )}
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
  item: { marginBottom: 12 },
});

export default FeedbackInsightsModal;
