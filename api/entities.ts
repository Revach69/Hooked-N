import { db } from '../lib/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData
} from 'firebase/firestore';

// --- Generic Firestore collection helpers ---

const collectionMethods = (collectionName: string) => ({
  list: async (): Promise<DocumentData[]> => {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  get: async (id: string): Promise<DocumentData | null> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  create: async (data: DocumentData) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  },

  update: async (id: string, data: Partial<DocumentData>) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return true;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  },

  filter: async (filters: Record<string, any>) => {
    const constraints = Object.entries(filters).map(
      ([field, value]) => where(field, '==', value)
    );
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
});

// --- Custom Helpers for current user ---

const getDocByField = async (
  collectionName: string,
  field: string,
  value: string
): Promise<{ id: string; [key: string]: any } | null> => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

const updateDocById = async (
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
  return true;
};

// --- Entity Definitions ---

export const Event = collectionMethods('events');
export const EventProfile = collectionMethods('event_profiles');
export const Like = collectionMethods('likes');
export const Message = collectionMethods('messages');
export const ContactShare = collectionMethods('contact_shares');
export const EventFeedback = collectionMethods('event_feedback');

// --- Custom User Methods (replaces Base44 SDK) ---

export const User = {
  ...collectionMethods('users'),

  me: async () => {
    const sessionId = await AsyncStorage.getItem("currentSessionId");
    if (!sessionId) return null;
    return await getDocByField("users", "session_id", sessionId);
  },

  updateMyUserData: async (data: Partial<DocumentData>) => {
    const sessionId = await AsyncStorage.getItem("currentSessionId");
    if (!sessionId) throw new Error("No session ID in storage.");
    const userDoc = await getDocByField("users", "session_id", sessionId);
    if (!userDoc) throw new Error("User not found.");
    return await updateDocById("users", userDoc.id, data);
  }
};
