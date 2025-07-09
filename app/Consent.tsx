import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
  Modal,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from 'react-native';
import toast from '../lib/toast';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { User, EventProfile, Event } from '../api/entities';
import { UploadFile } from '../api/integrations';
import { saveLocalProfile, getLocalProfile } from '../lib/localProfile';

// Simple UUID v4 generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

type Step = 'manual' | 'processing' | 'error';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (val: string) => void;
  placeholder: string;
  dark?: boolean;
}

const Dropdown = ({ options, value, onChange, placeholder, dark }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.dropdownContainer}>
      <Pressable
        style={[styles.dropdown, dark && styles.dropdownDark]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selected ? selected.label : placeholder}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={[styles.modalContent, dark && styles.modalContentDark]}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function Consent() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const [event, setEvent] = useState<any>(null);
  const [step, setStep] = useState<Step>('manual');
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    age: '',
    gender_identity: '',
    interested_in: '',
    profile_photo_url: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadProfile = useCallback(async () => {
    const saved = await getLocalProfile();
    if (saved) {
      setFormData(prev => ({
        ...prev,
        first_name: saved.fullName || prev.first_name,
        age: saved.age != null ? String(saved.age) : prev.age,
        gender_identity: saved.gender || prev.gender_identity,
        interested_in: Array.isArray(saved.interests)
          ? saved.interests.join(', ')
          : prev.interested_in,
        profile_photo_url: (saved as any).profile_photo_url || prev.profile_photo_url,
      }));
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const fetchEvent = useCallback(async () => {
    const eventId = await AsyncStorage.getItem('currentEventId');
    if (!eventId) {
      // @ts-ignore - navigation type not specified
      (navigation as any).navigate('Home');
      return;
    }
    try {
      const events = await Event.filter({ id: eventId });
      if (events.length > 0) {
        setEvent(events[0]);
      } else {
        (navigation as any).navigate('Home');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      (navigation as any).navigate('Home');
    }
  }, [navigation]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [step]);

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];

    // Validate file size (5MB limit)
    try {
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (info.size && info.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB.');
        return;
      }
    } catch (e) {
      console.warn('Could not get file info', e);
    }

    setIsUploadingPhoto(true);
    const file = {
      uri: asset.uri,
      name: asset.fileName || 'photo.jpg',
      type: asset.mimeType || 'image/jpeg'
    } as any;

    try {
      const { url } = await UploadFile(file.uri);
      setFormData(prev => ({ ...prev, profile_photo_url: url }));
      toast({ type: 'success', text1: 'Photo uploaded' });
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields including photo
    if (!formData.first_name || !formData.email || !formData.age || !formData.gender_identity || !formData.interested_in) {
      setError('Please fill in all fields.');
      return;
    }

    if (!formData.profile_photo_url) {
      setError('Please upload a profile photo.');
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    try {
      const sessionId = generateUUID();
      const profileColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

      await User.updateMyUserData({
        profile_photo_url: formData.profile_photo_url,
        age: parseInt(formData.age, 10),
        gender_identity: formData.gender_identity,
        interested_in: formData.interested_in,
        profile_color: profileColor
      });

      await EventProfile.create({
        event_id: event.id,
        session_id: sessionId,
        first_name: formData.first_name,
        email: formData.email,
        age: parseInt(formData.age, 10),
        gender_identity: formData.gender_identity,
        interested_in: formData.interested_in,
        profile_color: profileColor,
        profile_photo_url: formData.profile_photo_url,
        is_visible: true
      });

      await AsyncStorage.setItem('currentSessionId', sessionId);
      await AsyncStorage.setItem('currentProfileColor', profileColor);
      await AsyncStorage.setItem('currentProfilePhotoUrl', formData.profile_photo_url);

      await saveLocalProfile({
        fullName: formData.first_name.trim(),
        phoneNumber: '',
        age: parseInt(formData.age.trim(), 10),
        gender: formData.gender_identity.trim(),
        instagram: '',
        interests: formData.interested_in
          .split(',')
          .map(i => i.trim())
          .filter(Boolean),
        profile_photo_url: formData.profile_photo_url,
      });

      toast({ type: 'success', text1: 'Profile created!' });
      Alert.alert('Success', 'Profile created! Welcome to the event.');
      (navigation as any).navigate('Discovery');
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile. Please try again.');
      toast({ type: 'error', text1: 'Failed to create profile' });
      Alert.alert('Error', 'Failed to create profile. Please try again.');
      setStep('error');
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.title}>Create Your Event Profile</Text>
      {event && <Text style={styles.subtitle}>This profile is temporary and only for {event.name}.</Text>}

      <TouchableOpacity style={styles.photoWrapper} onPress={handlePhotoUpload} disabled={isUploadingPhoto}>
        {formData.profile_photo_url ? (
          <Image source={{ uri: formData.profile_photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {isUploadingPhoto && <ActivityIndicator style={styles.uploadIndicator} />}

      <TextInput
        placeholder="First Name"
        placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
        value={formData.first_name}
        onChangeText={text => setFormData({ ...formData, first_name: text })}
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
        value={formData.email}
        onChangeText={text => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
      />
      <TextInput
        placeholder="Age"
        placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
        value={formData.age}
        onChangeText={text => setFormData({ ...formData, age: text })}
        keyboardType="numeric"
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
      />
      <Dropdown
        options={[
          { label: 'Man', value: 'man' },
          { label: 'Woman', value: 'woman' },
        ]}
        value={formData.gender_identity}
        onChange={val => setFormData({ ...formData, gender_identity: val })}
        placeholder="I am a..."
        dark={colorScheme === 'dark'}
      />
      <Dropdown
        options={[
          { label: 'Men', value: 'men' },
          { label: 'Women', value: 'women' },
          { label: 'Everyone', value: 'everyone' },
        ]}
        value={formData.interested_in}
        onChange={val => setFormData({ ...formData, interested_in: val })}
        placeholder="I'm interested in..."
        dark={colorScheme === 'dark'}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <Button title="Join Event" onPress={handleSubmit} disabled={isUploadingPhoto} />
      )}
    </ScrollView>
  );

  const renderProcessing = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
      <Text style={styles.processingText}>Creating Your Profile...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
      <Button title="Try Again" onPress={() => setStep('manual')} />
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 'manual' && renderForm()}
      {step === 'processing' && renderProcessing()}
      {step === 'error' && renderError()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formContainer: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  photoWrapper: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  placeholderPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666'
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48
  },
  uploadIndicator: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#fff',
  },
  dropdownContainer: { marginBottom: 12 },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
  },
  dropdownDark: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  dropdownText: { color: '#000' },
  dropdownPlaceholder: { color: '#666' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    borderRadius: 8,
  },
  modalContentDark: {
    backgroundColor: '#444',
  },
  option: { padding: 12 },
  optionText: { color: '#000' },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  processingText: {
    marginTop: 16
  }
});
