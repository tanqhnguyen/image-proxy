import { WebServer } from '~types';

// TODO store this one in database
const KEYS = [
  'z7ZRvQuH5f8hMvCSPtRD7GtP',
  'BCUZhzSSg7wtwByFn5mXSWmE',
  '3j8M5x3NJqyFxHbmJVhHEznB',
  'AMYUMcLHRkk4pA43kJsQzEWm',
  '4FGB28Dd7WSCDv62w3WjDPB8',
  'cpJ86zhU7LNY2n9SmTZgYQw7',
  'tjj65K634P7UAu5wMkE2MgDX',
  'PxsUzGuag737P9AqNVSRyCmt',
  'tEgPvvj9e8uZBWunfxaKqJFd',
  'uYMPDHazXYCfDbcZHWKQYuSg',
];

export class SecretKeyStrategy implements WebServer.AuthStrategy {
  async verify(requestParams: object, headers: object): Promise<boolean> {
    const key = headers['X-SECRET-KEY'] || headers['x-secret-key'];
    return KEYS.indexOf(key) !== -1;
  }
}
