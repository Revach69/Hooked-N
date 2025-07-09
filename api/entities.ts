// api/entities.ts – Firebase replacement for Base44 entity methods

import { db } from '../lib/firebaseConfig';
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  query,
  where,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';

function getCollection(name: string) {
  return collection(db, name);
}

function getDocRef(name: string, id: string) {
  return doc(db, name, id);
}

export const FirebaseEntity = (collectionName: string) => ({
  list: async (): Promise<DocumentData[]> => {
    const snapshot = await getDocs(getCollection(collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  get: async (id: string): Promise<DocumentData | null> => {
    const snapshot = await getDoc(getDocRef(collectionName, id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },

  create: async (data: DocumentData): Promise<string> => {
    const docRef = await addDoc(getCollection(collectionName), data);
    return docRef.id;
  },

  update: async (id: string, data: Partial<DocumentData>): Promise<void> => {
    await updateDoc(getDocRef(collectionName, id), data);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(getDocRef(collectionName, id));
  },

  filter: async (filters: Record<string, any>): Promise<DocumentData[]> => {
    const constraints: QueryConstraint[] = Object.entries(filters).map(([key, value]) =>
      where(key, '==', value)
    );
    const q = query(getCollection(collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
});


export const Event = FirebaseEntity('events');
export const EventProfile = FirebaseEntity('event_profiles');
export const Like = FirebaseEntity('likes');
export const Message = FirebaseEntity('messages');
export const EventFeedback = FirebaseEntity('event_feedback');
export const User = FirebaseEntity('users');
export const ContactShare = FirebaseEntity('contact_shares');

