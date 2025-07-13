export function createPageUrl(pageName: string) {
<<<<<<< HEAD
    if (pageName.startsWith('/')) return pageName;
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
  }

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
=======
  if (pageName.startsWith('/')) return pageName;
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// Helper to construct relative page URLs, ensuring a leading slash
export function createPageUrlWithSlash(path: string): string {
  return `/${path.startsWith('/') ? path.substring(1) : path}`;
>>>>>>> 953708c96ef6745e7ca79ba67007fb824bfdca4b
}