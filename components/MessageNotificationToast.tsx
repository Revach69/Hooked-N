import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, X, ArrowRight } from 'lucide-react-native';

interface Props {
  visible: boolean;
  senderName: string;
  onDismiss: () => void;
  onView: () => void;
}

export default function MessageNotificationToast({ visible, senderName, onDismiss, onView }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <LinearGradient colors={['#3b82f6', '#0ea5e9', '#06b6d4']} style={styles.toast}>
        <TouchableOpacity onPress={onDismiss} style={styles.close} accessibilityRole="button">
          <X size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.row}>
          <MessageCircle size={40} color="#fff" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>New Message</Text>
            <Text style={styles.message}>You have a new message from {senderName}.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onView} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>View Message</Text>
          <ArrowRight size={16} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 100 },
  toast: { padding: 16, borderRadius: 12 },
  close: { position: 'absolute', top: 8, right: 8, padding: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  textContainer: { marginLeft: 8, flex: 1 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#fff', fontSize: 14, marginTop: 2 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, borderRadius: 8 },
  buttonText: { color: '#fff', marginRight: 6, fontWeight: '500' },
});
