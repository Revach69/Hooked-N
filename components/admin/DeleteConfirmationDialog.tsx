import React from 'react';
import { Text } from 'react-native';
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
      <AlertDialogContent className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-xl font-bold mb-4">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 mb-6">
            This action cannot be undone. This will permanently delete the event <strong>&quot;{eventName}&quot;</strong> and all associated data including profiles, likes, and messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
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

export default DeleteConfirmationDialog;
