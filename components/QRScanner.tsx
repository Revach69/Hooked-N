import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, type BarcodeScanningResult, Camera } from 'expo-camera';
import { Camera as CameraIcon, X } from 'lucide-react-native';
import { QRScannerProps, CameraPermissionResult } from '../types';
import { errorHandler } from '../utils/errorHandler';

export default function QRScanner({ onScan, onClose, onSwitchToManual }: QRScannerProps) {
  const [permission, setPermission] = useState<CameraPermissionResult['status']>('undetermined');
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async (): Promise<void> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status);
      
      if (status !== 'granted') {
        errorHandler.handlePermissionError('camera', 'Camera access is required to scan QR codes');
      }
    } catch (error) {
      errorHandler.handleError(error, 'QRScanner:requestCameraPermission', 'Failed to request camera permission');
      setPermission('denied');
    }
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult): void => {
    if (!scanning) return;
    
    try {
      setScanning(false);
      onScan(data);
    } catch (error) {
      errorHandler.handleError(error, 'QRScanner:handleBarCodeScanned', 'Failed to process scanned code');
      setScanning(true); // Re-enable scanning on error
    }
  };

  const handleClose = (): void => {
    setScanning(false);
    onClose();
  };

  const handleManual = (): void => {
    setScanning(false);
    onSwitchToManual?.();
  };

  const renderContent = (): React.ReactNode => {
    if (permission === 'undetermined') {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loadingText}>Starting camera...</Text>
        </View>
      );
    }

    if (permission === 'denied') {
      return (
        <View style={styles.message}>
          <CameraIcon size={48} color="#fff" />
          <Text style={styles.messageText}>Please allow camera access to scan codes.</Text>
          {onSwitchToManual && (
            <TouchableOpacity 
              onPress={handleManual} 
              style={styles.manualButton} 
              accessibilityRole="button"
              accessibilityLabel="Enter code manually"
            >
              <Text style={styles.manualButtonText}>Enter Code Manually</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
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
  };

  return (
    <Modal 
      visible 
      transparent 
      animationType="fade" 
      onRequestClose={handleClose}
      accessibilityLabel="QR Code Scanner"
    >
      <View style={styles.container}>
        {renderContent()}
        <TouchableOpacity 
          onPress={handleClose} 
          style={styles.closeButton} 
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  loading: { 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#fff', 
    marginTop: 8 
  },
  message: { 
    alignItems: 'center', 
    padding: 20 
  },
  messageText: { 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 16 
  },
  manualButton: { 
    marginTop: 16, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: '#fff', 
    borderRadius: 8 
  },
  manualButtonText: { 
    color: '#fff' 
  },
  frameWrapper: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  frame: { 
    width: 250, 
    height: 250 
  },
  corner: { 
    position: 'absolute', 
    width: 40, 
    height: 40, 
    borderColor: '#ec4899' 
  },
  topLeft: { 
    top: 0, 
    left: 0, 
    borderTopWidth: 4, 
    borderLeftWidth: 4, 
    borderTopLeftRadius: 12 
  },
  topRight: { 
    top: 0, 
    right: 0, 
    borderTopWidth: 4, 
    borderRightWidth: 4, 
    borderTopRightRadius: 12 
  },
  bottomLeft: { 
    bottom: 0, 
    left: 0, 
    borderBottomWidth: 4, 
    borderLeftWidth: 4, 
    borderBottomLeftRadius: 12 
  },
  bottomRight: { 
    bottom: 0, 
    right: 0, 
    borderBottomWidth: 4, 
    borderRightWidth: 4, 
    borderBottomRightRadius: 12 
  },
  instructions: { 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 16 
  },
  closeButton: { 
    position: 'absolute', 
    top: 40, 
    right: 20, 
    padding: 8 
  },
});
