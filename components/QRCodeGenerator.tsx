import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Download, AlertCircle } from 'lucide-react-native';
import toast from '../lib/toast';
import * as FileSystem from 'expo-file-system';

import { Button } from './ui/button';

export interface QRCodeGeneratorProps {
  url: string;
  fileName: string;
}

export default function QRCodeGenerator({ url, fileName }: QRCodeGeneratorProps) {
  const [error, setError] = useState(false);
  const qrRef = useRef<any>(null);

  const handleDownload = () => {
    if (error) {
      toast({ type: 'error', text1: 'Cannot download QR code.' });
      return;
    }

    qrRef.current?.toDataURL(async (data: string) => {
      try {
        const path = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(path, data, { encoding: FileSystem.EncodingType.Base64 });
        toast({ type: 'success', text1: 'QR code saved.' });
      } catch (e) {
        console.error('Error saving QR code:', e);
        toast({ type: 'error', text1: 'Failed to save QR code.' });
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        {error ? (
          <View style={styles.errorContent}>
            <AlertCircle size={32} color="#dc2626" style={styles.errorIcon} />
            <Text style={styles.errorText}>Failed to load QR code.</Text>
          </View>
        ) : (
          <QRCode
            value={url}
            size={200}
            getRef={(c) => (qrRef.current = c)}
            onError={() => setError(true)}
          />
        )}
      </View>
      <Button
        onPress={handleDownload}
        variant="outline"
        size="sm"
        disabled={error}
        style={styles.button}
      >
        <Download size={16} color="#1f2937" style={styles.icon} />
        <Text style={styles.buttonText}>Download QR</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  qrBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: { alignItems: 'center', justifyContent: 'center' },
  errorIcon: { marginBottom: 4 },
  errorText: { fontSize: 12, color: '#dc2626' },
  button: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  icon: { marginRight: 6 },
  buttonText: { color: '#1f2937', fontSize: 14 },
});
