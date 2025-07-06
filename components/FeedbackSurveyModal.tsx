import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  event: any;
  sessionId: string;
  onClose: () => void;
}

export default function FeedbackSurveyModal({ event, onClose }: Props) {
  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Enjoyed Hooked at {event?.name}?</Text>
          <Text style={styles.message}>Feedback form is not available on mobile.</Text>
          <TouchableOpacity onPress={onClose} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 14, marginBottom: 16 },
  button: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#ec4899', borderRadius: 8 },
  buttonText: { color: '#fff' },
});
