import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from './firebase/firestore';
import { errorHandler } from '../utils/errorHandler';

export interface LocalProfile extends Profile {
  profile_photo_url?: string;
}

const LOCAL_PROFILE_KEY = 'localProfile';

function isLocalProfile(data: unknown): data is LocalProfile {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const p = data as Record<string, unknown>;
  if (typeof p.fullName !== 'string') {
    return false;
  }
  if (p.phoneNumber !== undefined && typeof p.phoneNumber !== 'string') {
    return false;
  }
  if (p.age !== undefined && typeof p.age !== 'number') {
    return false;
  }
  if (p.gender !== undefined && typeof p.gender !== 'string') {
    return false;
  }
  if (p.instagram !== undefined && typeof p.instagram !== 'string') {
    return false;
  }
  if (p.interests !== undefined && !Array.isArray(p.interests)) {
    return false;
  }
  if (p.profile_photo_url !== undefined && typeof p.profile_photo_url !== 'string') {
    return false;
  }
  return true;
}

export async function saveLocalProfile(profile: LocalProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    errorHandler.handleError(error, 'LocalProfile:saveLocalProfile', 'Failed to save profile locally');
  }
}

export async function getLocalProfile(): Promise<LocalProfile | null> {
  try {
    const json = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
    if (!json) return null;
    const data = JSON.parse(json);
    if (isLocalProfile(data)) {
      return data;
    }
    return null;
  } catch (error) {
    errorHandler.handleError(error, 'LocalProfile:getLocalProfile', 'Failed to retrieve local profile');
    return null;
  }
}
