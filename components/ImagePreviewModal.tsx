import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface ProfilePreview {
  profile_photo_url?: string;
  profile_color?: string;
  first_name?: string;
}

interface Props {
  profile?: ProfilePreview | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ profile, onClose }: Props) {
  if (!profile) return null;
  const { profile_photo_url, profile_color, first_name } = profile;
  const avatarInitial = first_name ? first_name[0].toUpperCase() : '?';

  return (
    <Modal visible onRequestClose={onClose} transparent animationType="fade">
      <View style={styles.overlay}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          minimumZoomScale={1}
          maximumZoomScale={3}
          centerContent
        >
          {profile_photo_url ? (
            <Image
              source={{ uri: profile_photo_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.fallback, { backgroundColor: profile_color || '#cccccc' }]}>
              <Text style={styles.fallbackText}>{avatarInitial}</Text>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Close image preview"
          accessibilityRole="button"
        >
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 80,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
});
