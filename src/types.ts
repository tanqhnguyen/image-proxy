import { Image as ImageEntity } from '~entities/Image';

import * as fs from 'fs';

export type WithoutMetaColumn<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export interface Image {
    upsert(image: WithoutMetaColumn<ImageEntity>): Promise<ImageEntity>;
    getIdByUrl(url: string, query?: object): Promise<string | null>;
  }

  export interface File {
    getRemote(url: string, query?: object): Promise<Buffer>;
  }
}

export namespace Service {
  export interface Proxy {
    getDestination(url: string, query?: object): Promise<string>;
  }
}

export interface FileFetcher {
  getRemoteAsBuffer(url: string, query?: object): Promise<Buffer>;
}

export interface BackgroundJob<T> {
  schedule(params: T): Promise<void>;
}
