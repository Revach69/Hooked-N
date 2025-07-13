import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AlertDialogProps {
  visible?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const AlertDialog = ({ visible, open, onClose, onOpenChange, children }: AlertDialogProps) => {
  const isVisible = visible ?? open ?? false;
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <Modal transparent visible={isVisible} onRequestClose={handleClose} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.content}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
};

const AlertDialogTrigger: React.FC<{ onPress?: () => void; children?: React.ReactNode }> = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

const AlertDialogPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
const AlertDialogOverlay: React.FC<{ style?: any; onPress?: () => void }> = ({ style, onPress }) => (
  <TouchableOpacity style={[styles.overlay, style]} activeOpacity={1} onPress={onPress} />
);
const AlertDialogContent: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.content, style]}>{children}</View>
);
const AlertDialogHeader: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);
const AlertDialogFooter: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);
const AlertDialogTitle: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);
const AlertDialogDescription: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);
const AlertDialogAction: React.FC<{ onPress?: () => void; children?: React.ReactNode }> = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress} style={styles.action}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </TouchableOpacity>
);
const AlertDialogCancel: React.FC<{ onPress?: () => void; children?: React.ReactNode }> = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress} style={styles.cancel}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: '#fff', padding: 20, borderRadius: 8, minWidth: 300 },
  header: { marginBottom: 12 },
  footer: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14 },
  action: { marginLeft: 8, padding: 8 },
  cancel: { marginLeft: 8, padding: 8 },
});

AlertDialog.displayName = 'AlertDialog';
AlertDialogOverlay.displayName = 'AlertDialogOverlay';
AlertDialogTrigger.displayName = 'AlertDialogTrigger';
AlertDialogPortal.displayName = 'AlertDialogPortal';
AlertDialogContent.displayName = 'AlertDialogContent';
AlertDialogHeader.displayName = 'AlertDialogHeader';
AlertDialogFooter.displayName = 'AlertDialogFooter';
AlertDialogTitle.displayName = 'AlertDialogTitle';
AlertDialogDescription.displayName = 'AlertDialogDescription';
AlertDialogAction.displayName = 'AlertDialogAction';
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
