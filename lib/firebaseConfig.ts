import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { errorHandler } from '../utils/errorHandler';

// ✅ React Native Firebase doesn't need explicit initialization
// It automatically uses the GoogleService-Info.plist configuration

// ✅ Export the Firebase services
export { firestore, storage };

// ✅ For compatibility with existing code, export as db
export const db = firestore();
