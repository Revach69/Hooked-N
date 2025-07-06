import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'hooked_session_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function saveSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, id);
}

export async function clearSessionId(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
