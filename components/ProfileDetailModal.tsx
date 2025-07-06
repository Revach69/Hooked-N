import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Heart, X, Calendar, Ruler } from 'lucide-react-native';
import { Button } from './ui/button';

export interface Profile {
  profile_photo_url?: string;
  profile_color?: string;
  first_name: string;
  age?: number;
  height?: number;
  interests?: string[];
  bio?: string;
  session_id?: string;
}

interface Props {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
  isLiked: boolean;
}

export default function ProfileDetailModal({ profile, onClose, onLike, isLiked }: Props) {
  if (!profile) return null;
  const { profile_photo_url, profile_color, first_name, age, height, interests, bio } = profile;
  const avatarInitial = first_name ? first_name[0].toUpperCase() : '?';

  return (
    <Modal visible onRequestClose={onClose} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.imageWrapper}>
              {profile_photo_url ? (
                <Image
                  source={{ uri: profile_photo_url }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => {}}
                />
              ) : (
                <View style={[styles.fallback, { backgroundColor: profile_color || '#888' }]}> 
                  <Text style={styles.fallbackText}>{avatarInitial}</Text>
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close profile">
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text style={styles.name}>{first_name}</Text>
              <View style={styles.metaRow}>
                {age && (
                  <View style={styles.metaItem}>
                    <Calendar size={16} color="#6b7280" style={styles.metaIcon} />
                    <Text style={styles.metaText}>{age} years old</Text>
                  </View>
                )}
                {height && (
                  <View style={styles.metaItem}>
                    <Ruler size={16} color="#6b7280" style={styles.metaIcon} />
                    <Text style={styles.metaText}>{height} cm</Text>
                  </View>
                )}
              </View>
              {bio && <Text style={styles.bio}>{bio}</Text>}
              {interests && interests.length > 0 && (
                <View style={styles.interestsWrap}>
                  {interests.map(int => (
                    <View key={int} style={styles.interestBadge}>
                      <Text style={styles.interestText}>{int}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <Button onPress={onLike} disabled={isLiked} style={styles.likeBtn}>
            <Heart
              size={20}
              color={isLiked ? '#ec4899' : '#fff'}
              fill={isLiked ? '#ec4899' : 'none'}
              style={{ marginRight: 8 }}
            />
            {isLiked ? 'Already Liked' : `Like ${first_name}`}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', maxHeight: '90%' },
  imageWrapper: { position: 'relative', width: '100%', height: 300 },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#fff', fontSize: 64, fontWeight: '700' },
  closeBtn: { position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
  section: { padding: 16 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { marginRight: 4 },
  metaText: { color: '#6b7280' },
  bio: { marginTop: 8, marginBottom: 8 },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  interestText: { fontSize: 12 },
  likeBtn: { margin: 16, borderRadius: 8 },
});
