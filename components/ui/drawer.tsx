import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DrawerProps {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Drawer = ({ visible, onClose, children }: DrawerProps) => (
  <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.content}>{children}</View>
    </TouchableOpacity>
  </Modal>
);

const DrawerTrigger: React.FC<{ onPress?: () => void; children?: React.ReactNode }> = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const DrawerPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
const DrawerOverlay: React.FC<{ style?: any; onPress?: () => void }> = ({ style, onPress }) => (
  <TouchableOpacity style={[styles.overlay, style]} activeOpacity={1} onPress={onPress} />
);
const DrawerContent: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.content, style]}>{children}</View>
);
const DrawerHeader: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
const DrawerFooter: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
const DrawerTitle: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);
const DrawerDescription: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);
const DrawerClose: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.close}>
    <Text>X</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  header: { marginBottom: 12, alignItems: 'center' },
  footer: { marginTop: 12 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14 },
  close: { position: 'absolute', top: 4, right: 4, padding: 4 },
});

Drawer.displayName = 'Drawer';
DrawerOverlay.displayName = 'DrawerOverlay';
DrawerTrigger.displayName = 'DrawerTrigger';
DrawerPortal.displayName = 'DrawerPortal';
DrawerContent.displayName = 'DrawerContent';
DrawerHeader.displayName = 'DrawerHeader';
DrawerFooter.displayName = 'DrawerFooter';
DrawerTitle.displayName = 'DrawerTitle';
DrawerDescription.displayName = 'DrawerDescription';
DrawerClose.displayName = 'DrawerClose';

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
