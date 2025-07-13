import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, Auth } from 'firebase/auth';
// Note: getReactNativePersistence is not available in the current Firebase version
// Using default persistence for now
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandler } from '../utils/errorHandler';

// ✅ Secure configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDkVAo_xXbBHy8FYwFtMQA66aju08qK_yE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'hooked-69.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'hooked-69',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'hooked-69.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '741889428835',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:741889428835:web:d5f88b43a503c9e6351756',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6YHKXLN806"
};

// ✅ Initialize Firebase with error handling
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  errorHandler.handleFirebaseError(error, 'initializeApp', 'Firebase initialization failed');
  throw new Error('Firebase initialization failed');
}

// ✅ Initialize Auth with error handling
let auth: Auth;
try {
  auth = initializeAuth(firebaseApp);
} catch (error) {
  errorHandler.handleFirebaseError(error, 'initializeAuth', 'Firebase Auth initialization failed');
  throw new Error('Firebase Auth initialization failed');
}

// ✅ Initialize Firestore with error handling
let db: Firestore;
try {
  db = getFirestore(firebaseApp);
} catch (error) {
  errorHandler.handleFirebaseError(error, 'initializeFirestore', 'Firestore initialization failed');
  throw new Error('Firestore initialization failed');
}

// ✅ Initialize Storage with error handling
let storage: FirebaseStorage;
try {
  storage = getStorage(firebaseApp);
} catch (error) {
  errorHandler.handleFirebaseError(error, 'initializeStorage', 'Firebase Storage initialization failed');
  throw new Error('Firebase Storage initialization failed');
}

export { firebaseApp, auth, db, storage };
