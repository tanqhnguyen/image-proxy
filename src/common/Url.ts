import { URL } from 'url';

export function normalizeUrl(url: string, query?: object): string {
  const urlObject = new URL(url);
  Object.entries(query || {}).forEach(([key, value]) => {
    urlObject.searchParams.append(key, value);
  });

  return urlObject.toString();
}
