import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DialogProps {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Dialog = ({ visible, onClose, children }: DialogProps) => (
  <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.content}>{children}</View>
    </TouchableOpacity>
  </Modal>
);

const DialogTrigger: React.FC<{ onPress?: () => void; children?: React.ReactNode }> = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const DialogPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
const DialogOverlay: React.FC<{ style?: any; onPress?: () => void }> = ({ style, onPress }) => (
  <TouchableOpacity style={[styles.overlay, style]} activeOpacity={1} onPress={onPress} />
);
const DialogContent: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.content, style]}>{children}</View>
);
const DialogHeader: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
const DialogFooter: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
const DialogTitle: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);
const DialogDescription: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);
const DialogClose: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.close}>
    <Text>X</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: '#fff', padding: 20, borderRadius: 8, minWidth: 300 },
  header: { marginBottom: 12 },
  footer: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14 },
  close: { position: 'absolute', top: 4, right: 4, padding: 4 },
});

Dialog.displayName = 'Dialog';
DialogOverlay.displayName = 'DialogOverlay';
DialogTrigger.displayName = 'DialogTrigger';
DialogPortal.displayName = 'DialogPortal';
DialogContent.displayName = 'DialogContent';
DialogHeader.displayName = 'DialogHeader';
DialogFooter.displayName = 'DialogFooter';
DialogTitle.displayName = 'DialogTitle';
DialogDescription.displayName = 'DialogDescription';
DialogClose.displayName = 'DialogClose';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
