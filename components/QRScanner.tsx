import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, CameraType, type BarCodeScanningResult } from 'expo-camera';
import { Camera as CameraIcon, X } from 'lucide-react-native';

interface Props {
  onScan: (value: string) => void;
  onClose: () => void;
  onSwitchToManual?: () => void;
}

export default function QRScanner({ onScan, onClose, onSwitchToManual }: Props) {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (!scanning) return;
    setScanning(false);
    onScan(data);
  };

  const handleClose = () => {
    setScanning(false);
    onClose();
  };

  const handleManual = () => {
    setScanning(false);
    onSwitchToManual && onSwitchToManual();
  };

  let content: React.ReactNode;
  if (permission === null) {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Starting camera...</Text>
      </View>
    );
  } else if (permission === false) {
    content = (
      <View style={styles.message}>
        <CameraIcon size={48} color="#fff" />
        <Text style={styles.messageText}>Please allow camera access to scan codes.</Text>
        {onSwitchToManual && (
          <TouchableOpacity onPress={handleManual} style={styles.manualButton} accessibilityRole="button">
            <Text style={styles.manualButtonText}>Enter Code Manually</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  } else {
    content = (
      <>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          type={CameraType.back}
          onBarCodeScanned={handleBarCodeScanned}
        />
        <View style={styles.frameWrapper} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructions}>Position the QR code inside the frame.</Text>
        </View>
      </>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        {content}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton} accessibilityRole="button">
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  loading: { alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 8 },
  message: { alignItems: 'center', padding: 20 },
  messageText: { color: '#fff', textAlign: 'center', marginTop: 16 },
  manualButton: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#fff', borderRadius: 8 },
  manualButtonText: { color: '#fff' },
  frameWrapper: { alignItems: 'center', justifyContent: 'center' },
  frame: { width: 250, height: 250 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#ec4899' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  instructions: { color: '#fff', textAlign: 'center', marginTop: 16 },
  closeButton: { position: 'absolute', top: 40, right: 20, padding: 8 },
});
