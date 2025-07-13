export function createPageUrl(pageName: string) {
  if (pageName.startsWith('/')) return pageName;
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// Helper to construct relative page URLs, ensuring a leading slash
export function createPageUrlWithSlash(path: string): string {
  return `/${path.startsWith('/') ? path.substring(1) : path}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}