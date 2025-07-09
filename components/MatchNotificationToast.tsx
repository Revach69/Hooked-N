import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PartyPopper, X, ArrowRight } from 'lucide-react-native';

interface Props {
  visible: boolean;
  matchName: string;
  onDismiss: () => void;
  onSeeMatches: () => void;
}

export default function MatchNotificationToast({ visible, matchName, onDismiss, onSeeMatches }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <LinearGradient colors={[ '#ec4899', '#8b5cf6', '#6366f1' ]} style={styles.toast}>
        <TouchableOpacity onPress={onDismiss} style={styles.close} accessibilityRole="button">
          <X size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.row}>
          <PartyPopper size={40} color="#facc15" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>It's a Match!</Text>
            <Text style={styles.message}>You and {matchName} liked each other.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onSeeMatches} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>See Matches</Text>
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
