import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Phone, User, CheckCircle, X } from 'lucide-react-native';

interface ContactInfo {
  email: string;
  phoneNumber: string;
  instagram: string;
}

interface Props {
  matchName: string;
  onConfirm: (info: ContactInfo) => Promise<void> | void;
  onCancel: () => void;
  isSharing?: boolean;
}

export default function ContactShareModal({ matchName, onConfirm, onCancel }: Props) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phoneNumber: '',
    instagram: '',
  });
  const [step, setStep] = useState<'confirm' | 'enter' | 'success'>('confirm');
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialShare = () => {
    // On mobile we skip automatic contact lookup and go straight to manual entry
    setStep('enter');
  };

  const handleManualEntry = () => {
    if (!contactInfo.email && !contactInfo.phoneNumber && !contactInfo.instagram) {
      return;
    }
    handleConfirmShare(contactInfo);
  };

  const handleConfirmShare = async (info: ContactInfo) => {
    setIsLoading(true);
    try {
      await onConfirm(info);
      setStep('success');
      Toast.show({ type: 'success', text1: 'Contact info shared!' });
      setTimeout(onCancel, 1500);
    } catch (error) {
      console.error('Error sharing contact info:', error);
      Alert.alert('Error', 'Failed to share contact info. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onCancel} style={styles.close} accessibilityRole="button">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>

          {step === 'confirm' && (
            <View style={styles.center}>
              <View style={styles.iconBlue}>
                <Phone size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Share Contact Info?</Text>
              <Text style={styles.message}>
                This will share your contact info with {matchName}. This action cannot be undone.
              </Text>
              <View style={styles.actions}>
                <Button title="Not Yet" onPress={onCancel} disabled={isLoading} />
                <Button title="Share" onPress={handleInitialShare} disabled={isLoading} />
              </View>
            </View>
          )}

          {step === 'enter' && (
            <View>
              <View style={styles.iconBlue}>
                <User size={32} color="#fff" />
              </View>
              <Text style={styles.titleCenter}>Enter Your Contact Info</Text>
              <Text style={styles.messageCenter}>Please enter your details to share with {matchName}</Text>

              <TextInput
                placeholder="Email"
                style={styles.input}
                value={contactInfo.email}
                onChangeText={text => setContactInfo(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={contactInfo.phoneNumber}
                onChangeText={text => setContactInfo(prev => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
              />
              <TextInput
                placeholder="Instagram"
                style={styles.input}
                value={contactInfo.instagram}
                onChangeText={text => setContactInfo(prev => ({ ...prev, instagram: text }))}
                autoCapitalize="none"
              />

              <View style={styles.actions}>
                <Button title="Back" onPress={() => setStep('confirm')} disabled={isLoading} />
                <TouchableOpacity
                  onPress={handleManualEntry}
                  disabled={isLoading}
                  style={styles.primaryButton}
                  accessibilityRole="button"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>Confirm Share</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.center}>
              <View style={styles.iconGreen}>
                <CheckCircle size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Contact Info Shared!</Text>
              <Text style={styles.message}>Your contact information has been shared with {matchName}.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  close: { position: 'absolute', top: 8, right: 8, padding: 8 },
  center: { alignItems: 'center' },
  iconBlue: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  iconGreen: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  titleCenter: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  message: { textAlign: 'center', color: '#6b7280', marginBottom: 16 },
  messageCenter: { textAlign: 'center', color: '#6b7280', marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  primaryButton: { backgroundColor: '#6366f1', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '500' },
});

