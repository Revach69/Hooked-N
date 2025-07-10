import * as FileSystem from 'expo-file-system';

export function isFileInfoSuccess(info: FileSystem.FileInfo): info is FileSystem.FileInfo & { size: number } {
  return info.exists && !info.isDirectory && 'size' in info;
}