import { storage } from '../lib/firebaseConfig';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';

// Firebase file upload function
export const UploadFile = async (fileUri: string): Promise<{ url: string }> => {
  if (!fileUri) throw new Error("File URI is required.");

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const fileId = uuid.v4() as string;
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
