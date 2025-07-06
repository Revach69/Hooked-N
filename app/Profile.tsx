import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { User, EventProfile } from '../api/entities';
import { UploadFile } from '../api/integrations';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Edit,
  Save,
  Trash2,
  Eye,
  EyeOff,
  X,
  Camera,
  LogOut,
  AlertCircle,
  Clock,
  Mail,
  CheckCircle2,
} from 'lucide-react-native';

const ALL_INTERESTS = [
  'music', 'tech', 'food', 'books', 'travel', 'art', 'fitness', 'nature',
  'movies', 'business', 'photography', 'dancing', 'yoga', 'gaming', 'comedy',
  'startups', 'fashion', 'spirituality', 'volunteering', 'crypto', 'cocktails',
  'politics', 'hiking', 'design', 'podcasts', 'pets', 'wellness'
];

export default function Profile() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [eventProfile, setEventProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState({ bio: false, interests: false, height: false });
  const [formData, setFormData] = useState({ bio: '', interests: [] as string[], height: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        (navigation as any).navigate('Home');
        return;
      }
      setUser(currentUser);
      setFormData({
        bio: currentUser.bio || '',
        interests: currentUser.interests || [],
        height: currentUser.height || ''
      });

      const eventId = await AsyncStorage.getItem('currentEventId');
      const sessionId = await AsyncStorage.getItem('currentSessionId');
      if (eventId && sessionId) {
        const profiles = await EventProfile.filter({ event_id: eventId, session_id: sessionId });
        if (profiles.length > 0) setEventProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Toast.show({ type: 'error', text1: 'Failed to load profile.' });
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditToggle = (field: 'bio' | 'interests' | 'height') => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      if (newInterests.length > 3) {
        Toast.show({ type: 'info', text1: 'You can select up to 3 interests.' });
        return prev;
      }
      return { ...prev, interests: newInterests };
    });
  };

  const handleSave = async (field: 'bio' | 'interests' | 'height') => {
    try {
      await User.updateMyUserData({ [field]: formData[field] });
      Toast.show({ type: 'success', text1: `${field.charAt(0).toUpperCase() + field.slice(1)} updated!` });
      handleEditToggle(field);
      await loadData();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Toast.show({ type: 'error', text1: `Failed to update ${field}.` });
    }
  };

  const handleProfilePhotoChange = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: 'Permission denied.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setLocalPhotoUri(asset.uri);
      setIsUploading(true);
      try {
        const file = { uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' } as any;
        const { file_url } = await UploadFile({ file });
        await User.updateMyUserData({ profile_photo_url: file_url });
        Toast.show({ type: 'success', text1: 'Profile photo updated!' });
        await loadData();
        setLocalPhotoUri(null);
      } catch (error) {
        console.error('Error uploading photo:', error);
        Toast.show({ type: 'error', text1: 'Failed to upload photo.' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleVisibility = async () => {
    if (!eventProfile) return;
    try {
      const newVisibility = !eventProfile.is_visible;
      await EventProfile.update(eventProfile.id, { is_visible: newVisibility });
      setEventProfile((prev: any) => ({ ...prev, is_visible: newVisibility }));
      Toast.show({ type: 'success', text1: `Profile is now ${newVisibility ? 'visible' : 'hidden'}.` });
    } catch (error) {
      console.error('Error updating visibility:', error);
      Toast.show({ type: 'error', text1: 'Failed to update visibility.' });
    }
  };

  const leaveEvent = async () => {
    if (!eventProfile) return;
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event? This will delete your profile for this event and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await EventProfile.delete(eventProfile.id);
              await AsyncStorage.multiRemove([
                'currentEventId',
                'currentSessionId',
                'currentEventCode',
                'currentProfileColor',
                'currentProfilePhotoUrl'
              ]);
              Toast.show({ type: 'success', text1: 'You have left the event.' });
              (navigation as any).navigate('Home');
            } catch (error) {
              console.error('Error leaving event:', error);
              Toast.show({ type: 'error', text1: 'Failed to leave event.' });
            }
          }
        }
      ]
    );
  };

  const handleReport = () => {
    Alert.alert('Report', 'Report functionality will be implemented soon.');
  };

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.photoWrapper} onPress={handleProfilePhotoChange}>
          {localPhotoUri || user.profile_photo_url ? (
            <Image source={{ uri: localPhotoUri || user.profile_photo_url }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.initialWrapper, { backgroundColor: user.profile_color }]}> 
              <Text style={styles.initial}>{user.full_name ? user.full_name[0] : '?'}</Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Camera size={28} color="#fff" />
          </View>
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.sub}>{user.age} years old</Text>
      </View>

      {/* Bio Section */}
      <Card style={styles.section}>
        <CardHeader style={styles.sectionHeader}>
          <CardTitle style={styles.sectionTitle}>About Me</CardTitle>
          <TouchableOpacity onPress={() => handleEditToggle('bio')}>
            {isEditing.bio ? <X size={16} /> : <Edit size={16} />}
          </TouchableOpacity>
        </CardHeader>
        <CardContent>
          {isEditing.bio ? (
            <View style={styles.editContainer}>
              <TextInput
                multiline
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us a little about yourself..."
                style={styles.textarea}
              />
              <Button onPress={() => handleSave('bio')} style={styles.saveButton}>
                <Save size={16} color="#fff" />
              </Button>
            </View>
          ) : (
            <Text style={styles.text}>{user.bio || 'No bio yet. Add one!'}</Text>
          )}
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card style={styles.section}>
        <CardHeader style={styles.sectionHeader}>
          <CardTitle style={styles.sectionTitle}>Interests</CardTitle>
          <TouchableOpacity onPress={() => handleEditToggle('interests')}>
            {isEditing.interests ? <X size={16} /> : <Edit size={16} />}
          </TouchableOpacity>
        </CardHeader>
        <CardContent>
          {isEditing.interests ? (
            <View style={styles.editContainer}>
              <View style={styles.interestsWrap}>
                {ALL_INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[styles.interestChip, selected && styles.interestSelected]}
                      onPress={() => handleInterestToggle(interest)}
                    >
                      <Text style={[styles.interestText, selected && styles.interestSelectedText]}>{interest}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.selectedCount}>{formData.interests.length} / 3 selected</Text>
              <Button onPress={() => handleSave('interests')} style={styles.saveButton}>
                <Save size={16} color="#fff" />
              </Button>
            </View>
          ) : (
            <View style={styles.interestsWrap}>
              {user.interests && user.interests.length > 0 ? (
                user.interests.map((interest: string) => (
                  <Badge key={interest} style={styles.badge}>{interest}</Badge>
                ))
              ) : (
                <Text style={styles.text}>No interests added yet.</Text>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Height Section */}
      <Card style={styles.section}>
        <CardHeader style={styles.sectionHeader}>
          <CardTitle style={styles.sectionTitle}>Height</CardTitle>
          <TouchableOpacity onPress={() => handleEditToggle('height')}>
            {isEditing.height ? <X size={16} /> : <Edit size={16} />}
          </TouchableOpacity>
        </CardHeader>
        <CardContent>
          {isEditing.height ? (
            <View style={styles.editContainer}>
              <TextInput
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                placeholder="Height in cm"
                style={styles.input}
              />
              <Button onPress={() => handleSave('height')} style={styles.saveButton}>
                <Save size={16} color="#fff" />
              </Button>
            </View>
          ) : (
            <Text style={styles.text}>{user.height ? `${user.height} cm` : 'Not specified'}</Text>
          )}
        </CardContent>
      </Card>

      {eventProfile && (
        <>
          <Card style={styles.section}>
            <CardHeader style={styles.sectionHeader}>
              <CardTitle style={styles.sectionTitle}>
                {eventProfile.is_visible ? <Eye size={16} color="green" /> : <EyeOff size={16} color="gray" />} Event Visibility
              </CardTitle>
              <Switch value={eventProfile.is_visible} onValueChange={toggleVisibility} />
            </CardHeader>
            <CardContent>
              <Text style={styles.textSmall}>
                {eventProfile.is_visible ? 'Your profile is visible to others at the current event.' : 'You are currently hidden from other attendees.'}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.section}>
            <CardHeader>
              <CardTitle style={[styles.sectionTitle, { color: '#dc2626' }]}> <LogOut size={16} color="#dc2626" /> Leave Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={styles.textSmall}>Permanently remove your profile from this event. This action cannot be undone.</Text>
              <Button onPress={leaveEvent} variant="destructive" style={styles.leaveButton}>
                <Trash2 size={16} color="#fff" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Safety & Reporting */}
      <Card style={[styles.section, styles.mtSection]}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>
            <AlertCircle size={16} color="#f97316" /> Safety & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={[styles.text, { marginBottom: 8 }]}>If you encounter inappropriate behavior, you can report users to event moderators.</Text>
          <Button
            variant="outline"
            style={[styles.reportButton]}
            onPress={handleReport}
          >
            <Text style={styles.reportButtonText}>Report a User</Text>
          </Button>
        </CardContent>
      </Card>

      {/* Automatic Data Expiration */}
      <Card style={styles.section}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>
            <Clock size={16} color="#3b82f6" /> Automatic Data Expiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={[styles.text, { marginBottom: 8 }]}>Your profile, matches, and chat messages will be automatically deleted when this event ends. No data is stored permanently.</Text>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#3b82f6" />
            <Text style={styles.bulletText}>Profile expires automatically</Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#3b82f6" />
            <Text style={styles.bulletText}>Messages deleted at midnight</Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#3b82f6" />
            <Text style={styles.bulletText}>No permanent account created</Text>
          </View>
        </CardContent>
      </Card>

      {/* Email Data Usage */}
      <Card style={styles.section}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>
            <Mail size={16} color="#a855f7" /> Email Data Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={[styles.text, { marginBottom: 8 }]}>Your email address is only used for post-event feedback surveys and is never visible to other users at this event.</Text>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#a855f7" />
            <Text style={styles.bulletText}>Only used for feedback requests</Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#a855f7" />
            <Text style={styles.bulletText}>Never shared with other users</Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color="#a855f7" />
            <Text style={styles.bulletText}>Not used for marketing purposes</Text>
          </View>
        </CardContent>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  photoWrapper: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden' },
  photo: { width: 96, height: 96, borderRadius: 48 },
  initialWrapper: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 40, color: '#fff' },
  cameraOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', opacity: 0 },
  uploadOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  sub: { color: '#6b7280' },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  editContainer: { gap: 8 },
  textarea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, minHeight: 80, textAlignVertical: 'top' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 },
  saveButton: { marginTop: 8 },
  leaveButton: { marginTop: 8 },
  text: { color: '#374151' },
  textSmall: { color: '#4b5563', fontSize: 12 },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  interestSelected: { backgroundColor: '#a78bfa', borderColor: '#a78bfa' },
  interestText: { color: '#374151', fontSize: 12 },
  interestSelectedText: { color: '#fff' },
  selectedCount: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  badge: { marginRight: 8, marginBottom: 8 },
  mtSection: { marginTop: 24 },
  reportButton: { width: '100%', borderColor: '#f97316' },
  reportButtonText: { color: '#f97316' },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  bulletText: { color: '#374151', fontSize: 12 },
});

