export function createPageUrl(pageName: string) {
    if (pageName.startsWith('/')) return pageName;
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
  }