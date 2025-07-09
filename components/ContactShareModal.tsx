import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Phone, User, CheckCircle, X } from 'lucide-react-native';
import toast from '../lib/toast';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  instagram: string;
}

interface Props {
  matchName: string;
  onConfirm: (info: ContactInfo) => Promise<void> | void;
  onCancel: () => void;
}

export default function ContactShareModal({ matchName, onConfirm, onCancel }: Props) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phoneNumber: '',
    instagram: '',
  });

  const [step, setStep] = useState<'confirm' | 'enter' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);

  const handleInitialShare = () => {
    setStep('enter');
  };

  const handleManualEntry = async () => {
    if (!contactInfo.fullName.trim()) {
      toast({ type: 'error', text1: 'Full name is required.' });
      return;
    }
    if (
      !contactInfo.email.trim() &&
      !contactInfo.phoneNumber.trim() &&
      !contactInfo.instagram.trim()
    ) {
      toast({ type: 'error', text1: 'Please enter at least one contact method.' });
      return;
    }
    setLoading(true);
    try {
      await onConfirm(contactInfo);
      setStep('success');
      toast({ type: 'success', text1: 'Contact info shared!' });
      setTimeout(onCancel, 2000);
    } catch (e) {
      console.error('Error sharing contact info:', e);
      toast({ type: 'error', text1: 'Failed to share contact info.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel} visible>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.close}
            accessibilityRole="button"
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>

          {step === 'confirm' && (
            <View style={styles.center}>
              <View style={styles.iconBlue}>
                <Phone size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Share Contact Info?</Text>
              <Text style={styles.message}>
                This will share your contact info with {matchName}.
              </Text>
              <View style={styles.actions}>
                <Button variant="outline" style={styles.half} onPress={onCancel}>
                  Not Yet
                </Button>
                <Button style={styles.half} onPress={handleInitialShare}>
                  Share
                </Button>
              </View>
            </View>
          )}

          {step === 'enter' && (
            <View>
              <View style={styles.iconBlue}>
                <User size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Enter Your Contact Info</Text>
              <Text style={styles.message}>Only {matchName} will see it</Text>

              <View style={styles.inputGroup}>
                <Label style={styles.label}>Full Name *</Label>
                <Input
                  value={contactInfo.fullName}
                  onChangeText={(t) => setContactInfo(p => ({ ...p, fullName: t }))}
                  placeholder="e.g. Alex Smith"
                />
              </View>
              <View style={styles.inputGroup}>
                <Label style={styles.label}>Email</Label>
                <Input
                  value={contactInfo.email}
                  onChangeText={(t) => setContactInfo(p => ({ ...p, email: t }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. alex@example.com"
                />
              </View>
              <View style={styles.inputGroup}>
                <Label style={styles.label}>Phone Number</Label>
                <Input
                  value={contactInfo.phoneNumber}
                  onChangeText={(t) => setContactInfo(p => ({ ...p, phoneNumber: t }))}
                  keyboardType="phone-pad"
                  placeholder="e.g. 555-123-4567"
                />
              </View>
              <View style={styles.inputGroup}>
                <Label style={styles.label}>Instagram</Label>
                <Input
                  value={contactInfo.instagram}
                  onChangeText={(t) => setContactInfo(p => ({ ...p, instagram: t }))}
                  autoCapitalize="none"
                  placeholder="@yourhandle"
                />
              </View>

              <View style={styles.actions}>
                <Button variant="outline" style={styles.half} onPress={() => setStep('confirm')}>
                  Back
                </Button>
                <Button
                  style={styles.half}
                  onPress={handleManualEntry}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : 'Confirm'}
                </Button>
              </View>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.center}>
              <View style={styles.iconGreen}>
                <CheckCircle size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Contact Info Shared!</Text>
              <Text style={styles.message}>Your contact was sent to {matchName}.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  center: {
    alignItems: 'center',
  },
  iconBlue: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  iconGreen: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  half: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
  },
});
