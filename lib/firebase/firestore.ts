import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';

const firestore = getFirestore(firebaseApp);

export { firestore };

export interface Profile {
  fullName: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  instagram?: string;
  interests?: string[];
}

function isProfile(data: unknown): data is Profile {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const profile = data as Record<string, unknown>;

  if (typeof profile.fullName !== 'string') {
    return false;
  }
  if (
    profile.phoneNumber !== undefined &&
    typeof profile.phoneNumber !== 'string'
  ) {
    return false;
  }
  if (profile.age !== undefined && typeof profile.age !== 'number') {
    return false;
  }
  if (profile.gender !== undefined && typeof profile.gender !== 'string') {
    return false;
  }
  if (profile.instagram !== undefined && typeof profile.instagram !== 'string') {
    return false;
  }
  if (profile.interests !== undefined && !Array.isArray(profile.interests)) {
    return false;
  }

  return true;
}

function isPartialProfile(data: unknown): data is Partial<Profile> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const profile = data as Record<string, unknown>;
  if (
    profile.fullName !== undefined &&
    typeof profile.fullName !== 'string'
  ) {
    return false;
  }
  if (
    profile.phoneNumber !== undefined &&
    typeof profile.phoneNumber !== 'string'
  ) {
    return false;
  }
  if (profile.age !== undefined && typeof profile.age !== 'number') {
    return false;
  }
  if (profile.gender !== undefined && typeof profile.gender !== 'string') {
    return false;
  }
  if (profile.instagram !== undefined && typeof profile.instagram !== 'string') {
    return false;
  }
  if (profile.interests !== undefined && !Array.isArray(profile.interests)) {
    return false;
  }
  return true;
}

export async function saveProfile(
  sessionId: string,
  data: Profile,
): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('saveProfile requires a valid sessionId');
    return;
  }
  if (!isProfile(data)) {
    console.error('saveProfile requires valid profile data');
    return;
  }

  try {
    await setDoc(doc(firestore, 'profiles', sessionId), data);
  } catch (error) {
    console.error(`Error saving profile for sessionId ${sessionId}:`, error);
  }
}

export async function getProfile(sessionId: string): Promise<Profile | null> {
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('getProfile requires a valid sessionId');
    return null;
  }

  try {
    const snapshot = await getDoc(doc(firestore, 'profiles', sessionId));
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (isProfile(data)) {
        return data;
      }
      console.error(`Profile data for sessionId ${sessionId} is invalid`);
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving profile for sessionId ${sessionId}:`, error);
    return null;
  }
}

export async function updateProfile(
  sessionId: string,
  data: Partial<Profile>,
): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('updateProfile requires a valid sessionId');
    return;
  }
  if (!isPartialProfile(data)) {
    console.error('updateProfile requires valid profile data');
    return;
  }

  try {
    await updateDoc(doc(firestore, 'profiles', sessionId), data);
  } catch (error) {
    console.error(`Error updating profile for sessionId ${sessionId}:`, error);
  }
}

export async function deleteProfile(sessionId: string): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('deleteProfile requires a valid sessionId');
    return;
  }

  try {
    await deleteDoc(doc(firestore, 'profiles', sessionId));
  } catch (error) {
    console.error(`Error deleting profile for sessionId ${sessionId}:`, error);
  }
}
