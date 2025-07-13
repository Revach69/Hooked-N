import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils';

const SESSION_KEY = 'hooked_session_id';

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id!;
}

export async function saveSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, id);
}

export async function clearSessionId(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
