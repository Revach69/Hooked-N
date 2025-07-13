import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera, Upload } from 'lucide-react-native';
import { isFileInfoSuccess } from '../../lib/helpers';
import { UploadFile } from '../../api/integrations';
import { errorHandler } from '../../utils/errorHandler';
import toast from '../../lib/toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  onError: (message: string) => void;
}

export default function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoUploaded, 
  onError 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1]
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // Validate file size (5MB limit)
      try {
        const info = await FileSystem.getInfoAsync(asset.uri);
        if (isFileInfoSuccess(info) && info.size > 5 * 1024 * 1024) {
          onError('Image must be smaller than 5MB.');
          return;
        }
      } catch (error) {
        errorHandler.handleError(error, 'ProfilePhotoUpload:validateFileSize', 'Could not validate file size');
      }

      setIsUploading(true);

      const file = {
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        type: asset.mimeType || 'image/jpeg'
      };

      const { url } = await UploadFile(file.uri);
      onPhotoUploaded(url);
      toast({ type: 'success', text1: 'Photo uploaded successfully' });
    } catch (error) {
      errorHandler.handleError(error, 'ProfilePhotoUpload:handlePhotoUpload', 'Failed to upload photo');
      onError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1]
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // Validate file size (5MB limit)
      try {
        const info = await FileSystem.getInfoAsync(asset.uri);
        if (isFileInfoSuccess(info) && info.size > 5 * 1024 * 1024) {
          onError('Image must be smaller than 5MB.');
          return;
        }
      } catch (error) {
        errorHandler.handleError(error, 'ProfilePhotoUpload:validateFileSize', 'Could not validate file size');
      }

      setIsUploading(true);

      const file = {
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        type: asset.mimeType || 'image/jpeg'
      };

      const { url } = await UploadFile(file.uri);
      onPhotoUploaded(url);
      toast({ type: 'success', text1: 'Photo captured and uploaded successfully' });
    } catch (error) {
      errorHandler.handleError(error, 'ProfilePhotoUpload:handleCameraCapture', 'Failed to capture and upload photo');
      onError('Failed to capture photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const showPhotoOptions = (): void => {
    Alert.alert(
      'Add Profile Photo',
      'Choose how you want to add your photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleCameraCapture },
        { text: 'Choose from Library', onPress: handlePhotoUpload }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Photo *</Text>
      
      {currentPhotoUrl ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: currentPhotoUrl }} style={styles.photo} />
          <TouchableOpacity 
            style={styles.changeButton} 
            onPress={showPhotoOptions}
            disabled={isUploading}
          >
            <Text style={styles.changeButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={showPhotoOptions}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Upload size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>Add Photo</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 