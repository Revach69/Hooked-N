import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hash, ArrowRight, X } from 'lucide-react-native';

export interface EventCodeEntryProps {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (code: string) => Promise<void> | void;
  onClose: () => void;
}

export default function EventCodeEntry({ onSubmit, onClose }: EventCodeEntryProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Event code is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(code.trim().toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <LinearGradient colors={[ '#8b5cf6', '#ec4899' ]} style={styles.iconWrap}>
              <Hash color="#fff" size={32} />
            </LinearGradient>
            <TouchableOpacity
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Enter Event Code</Text>
          <Text style={styles.subtitle}>
            Enter the code provided by the event organizer
          </Text>
          <View style={styles.form}>
            <TextInput
              placeholder="e.g., WED2025"
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              autoCapitalize="characters"
              style={styles.input}
            />
            <Text style={styles.helper}>Codes are usually 6-8 characters</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!code.trim() || loading}
                style={[styles.button, styles.submitButton, (!code.trim() || loading) && styles.buttonDisabled]}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.submitContent}>
                    <Text style={styles.submitText}>Join Event</Text>
                    <ArrowRight size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 24,
  },
  form: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  helper: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  error: { fontSize: 12, color: '#dc2626', textAlign: 'center' },
  buttons: { flexDirection: 'row', marginTop: 16, gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelText: { color: '#374151' },
  submitButton: {
    backgroundColor: '#8b5cf6',
  },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  submitText: { color: '#fff', marginRight: 4 },
  buttonDisabled: { opacity: 0.7 },
});
