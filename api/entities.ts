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
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';

// --- Generic Collection Methods ---
function getCollection(name: string) {
  return collection(db, name);
}

function getDocRef(name: string, id: string) {
  return doc(db, name, id);
}

function buildConstraints(filters: Record<string, any>): QueryConstraint[] {
  return Object.entries(filters).map(([key, value]) => where(key, '==', value));
}

const collectionMethods = (collectionName: string) => ({
  list: async (): Promise<DocumentData[]> => {
    const snapshot = await getDocs(getCollection(collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  get: async (id: string): Promise<DocumentData | null> => {
    const snapshot = await getDoc(getDocRef(collectionName, id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },

  create: async (data: DocumentData): Promise<{ id: string; [key: string]: any }> => {
    const docRef = await addDoc(getCollection(collectionName), data);
    return { id: docRef.id, ...data };
  },

  update: async (id: string, data: Partial<DocumentData>): Promise<void> => {
    await updateDoc(getDocRef(collectionName, id), data);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(getDocRef(collectionName, id));
  },

  filter: async (filters: Record<string, any>): Promise<DocumentData[]> => {
    const constraints = buildConstraints(filters);
    const q = query(getCollection(collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
});

// --- Custom Helpers for User Session Handling ---

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

// --- Exported Entity Methods ---

export const Event = collectionMethods('events');
export const EventProfile = collectionMethods('event_profiles');
export const Like = collectionMethods('likes');
export const Message = collectionMethods('messages');
export const ContactShare = collectionMethods('contact_shares');
export const EventFeedback = collectionMethods('event_feedback');

export const User = {
  ...collectionMethods('users'),

  me: async (): Promise<{ id: string; [key: string]: any } | null> => {
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
