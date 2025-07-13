import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';
import { errorHandler } from '../../utils/errorHandler';

const firestore: Firestore = getFirestore(firebaseApp);

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
    errorHandler.handleValidationError(['Invalid sessionId'], 'Firestore:saveProfile', 'Invalid session ID provided');
    return;
  }
  if (!isProfile(data)) {
    errorHandler.handleValidationError(['Invalid profile data'], 'Firestore:saveProfile', 'Invalid profile data provided');
    return;
  }

  try {
    await setDoc(doc(firestore, 'profiles', sessionId), data);
  } catch (error) {
    errorHandler.handleFirebaseError(error, 'saveProfile', `Failed to save profile for session ${sessionId}`);
  }
}

export async function getProfile(sessionId: string): Promise<Profile | null> {
  if (!sessionId || typeof sessionId !== 'string') {
    errorHandler.handleValidationError(['Invalid sessionId'], 'Firestore:getProfile', 'Invalid session ID provided');
    return null;
  }

  try {
    const snapshot = await getDoc(doc(firestore, 'profiles', sessionId));
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (isProfile(data)) {
        return data;
      }
      errorHandler.handleValidationError(['Invalid profile data'], 'Firestore:getProfile', `Profile data for session ${sessionId} is invalid`);
    }
    return null;
  } catch (error) {
    errorHandler.handleFirebaseError(error, 'getProfile', `Failed to retrieve profile for session ${sessionId}`);
    return null;
  }
}

export async function updateProfile(
  sessionId: string,
  data: Partial<Profile>,
): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    errorHandler.handleValidationError(['Invalid sessionId'], 'Firestore:updateProfile', 'Invalid session ID provided');
    return;
  }
  if (!isPartialProfile(data)) {
    errorHandler.handleValidationError(['Invalid profile data'], 'Firestore:updateProfile', 'Invalid profile data provided');
    return;
  }

  try {
    await updateDoc(doc(firestore, 'profiles', sessionId), data);
  } catch (error) {
    errorHandler.handleFirebaseError(error, 'updateProfile', `Failed to update profile for session ${sessionId}`);
  }
}

export async function deleteProfile(sessionId: string): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    errorHandler.handleValidationError(['Invalid sessionId'], 'Firestore:deleteProfile', 'Invalid session ID provided');
    return;
  }

  try {
    await deleteDoc(doc(firestore, 'profiles', sessionId));
  } catch (error) {
    errorHandler.handleFirebaseError(error, 'deleteProfile', `Failed to delete profile for session ${sessionId}`);
  }
}
