export function createPageUrl(pageName: string) {
  if (pageName.startsWith('/')) return pageName;
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// Helper to construct relative page URLs, ensuring a leading slash
export function createPageUrlWithSlash(path: string): string {
  return `/${path.startsWith('/') ? path.substring(1) : path}`;
}