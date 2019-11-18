import { URL } from 'url';
import * as mime from 'mime';

export function normalizeUrl(url: string, query?: object): string {
  const urlObject = new URL(url);
  Object.entries(query || {}).forEach(([key, value]) => {
    urlObject.searchParams.append(key, value);
  });

  return urlObject.toString();
}

export function extractFileExtension(
  url: string,
): { name: string; ext: string; mime: string } {
  const urlObject = new URL(url);
  const { pathname } = urlObject;
  const parts = pathname.split('/');

  const [fileName, fileExt] = parts.slice(-1)[0].split('.');

  return {
    name: fileName,
    ext: fileExt,
    mime: mime.getType(fileExt),
  };
}
