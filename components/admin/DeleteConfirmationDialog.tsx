import React from 'react';
import { Text, StyleSheet } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, eventName }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent style={styles.content}>
        <AlertDialogHeader style={styles.header}>
          <AlertDialogTitle style={styles.title}>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription style={styles.description}>
            This action cannot be undone. This will permanently delete the event <Text style={{ fontWeight: 'bold' }}>&quot;{eventName}&quot;</Text> and all associated data including profiles, likes, and messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter style={styles.footer}>
          <AlertDialogCancel onPress={onClose}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm}>
            <Text>Delete Event</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: '#fff', padding: 24, borderRadius: 12 },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  description: { marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});

export default DeleteConfirmationDialog;
