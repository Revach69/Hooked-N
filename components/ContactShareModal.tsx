import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Phone, User, CheckCircle, X } from 'lucide-react-native';

interface Props {
  matchName: string;
  onConfirm: (info: { fullName: string; phoneNumber: string }) => Promise<void>;
  onCancel: () => void;
}

export default function ContactShareModal({ matchName, onConfirm, onCancel }: Props) {
  const [contactInfo, setContactInfo] = useState({ fullName: '', phoneNumber: '' });
  const [step, setStep] = useState<'confirm' | 'enter' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);

  const handleInitialShare = async () => {
    setStep('enter');
  };

  const handleManualEntry = async () => {
    if (!contactInfo.fullName.trim() || !contactInfo.phoneNumber.trim()) return;
    setLoading(true);
    try {
      await onConfirm(contactInfo);
      setStep('success');
      setTimeout(onCancel, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Button onPress={onCancel} variant="ghost" size="icon" style={styles.close} accessibilityLabel="Close">
            <X size={16} color="#6b7280" />
          </Button>
          {step === 'confirm' && (
            <View style={styles.center}>
              <View style={styles.iconCircle}><Phone size={32} color="#fff" /></View>
              <Text style={styles.title}>Share Contact Info?</Text>
              <Text style={styles.message}>This will share your phone with {matchName}.</Text>
              <View style={styles.row}>
                <Button onPress={onCancel} variant="outline" style={styles.half}>Not Yet</Button>
                <Button onPress={handleInitialShare} style={styles.half}>Share</Button>
              </View>
            </View>
          )}
          {step === 'enter' && (
            <View>
              <View style={styles.iconCircle}><User size={32} color="#fff" /></View>
              <Text style={[styles.title, { textAlign: 'center' }]}>Enter Your Contact Info</Text>
              <View style={{ marginTop: 16 }}>
                <Label style={styles.label}>Full Name</Label>
                <Input value={contactInfo.fullName} onChangeText={v => setContactInfo(p => ({ ...p, fullName: v }))} style={styles.input} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Label style={styles.label}>Phone Number</Label>
                <Input value={contactInfo.phoneNumber} onChangeText={v => setContactInfo(p => ({ ...p, phoneNumber: v }))} style={styles.input} />
              </View>
              <View style={styles.row}>
                <Button variant="outline" style={styles.half} onPress={() => setStep('confirm')}>Back</Button>
                <Button style={styles.half} onPress={handleManualEntry} disabled={loading || !contactInfo.fullName.trim() || !contactInfo.phoneNumber.trim()}>{loading ? '...' : 'Confirm'}</Button>
              </View>
            </View>
          )}
          {step === 'success' && (
            <View style={styles.center}>
              <View style={[styles.iconCircle, { backgroundColor: '#22c55e' }]}><CheckCircle size={32} color="#fff" /></View>
              <Text style={styles.title}>Contact Info Shared!</Text>
              <Text style={styles.message}>Your info was sent to {matchName}.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 320 },
  close: { position: 'absolute', top: 8, right: 8 },
  center: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  message: { fontSize: 14, color: '#6b7280', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  half: { flex: 1, marginHorizontal: 4 },
  label: { marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8 },
});
