import { storage } from '../lib/firebaseConfig';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

// Simple UUID generation function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Firebase file upload function
export const UploadFile = async (fileUri: string): Promise<{ url: string }> => {
  if (!fileUri) throw new Error("File URI is required.");

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const fileId = generateUUID();
  const fileName = fileUri.split('/').pop() || 'file';
  const fileRef = ref(storage, `uploads/${fileName}-${fileId}`);

  await uploadBytes(fileRef, blob);
  const url = await getDownloadURL(fileRef);
  return { url };
};

// Placeholder Core object (to match Base44 style)
export const Core = {
  UploadFile,
  // You can add Firebase-based replacements here later:
  // InvokeLLM,
  // SendEmail,
  // GenerateImage,
  // ExtractDataFromUploadedFile
};
