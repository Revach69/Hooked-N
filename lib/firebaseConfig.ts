import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDkVAo_xXbBHy8FYwFtMQA66aju08qK_yE',
  authDomain: 'hooked-69.firebaseapp.com',
  projectId: 'hooked-69',
  storageBucket: 'hooked-69.firebasestorage.app',
  messagingSenderId: '741889428835',
  appId: '1:741889428835:web:d5f88b43a503c9e6351756',
  measurementId: "G-6YHKXLN806"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// ✅ Initialize Auth with React Native persistence
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Firestore
const db = getFirestore(firebaseApp);

const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage};
