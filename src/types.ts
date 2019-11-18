import { Image as ImageEntity } from '~entities/Image';

import * as fs from 'fs';

export type WithoutMetaColumn<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export interface Image {
    upsert(image: WithoutMetaColumn<ImageEntity>): Promise<ImageEntity>;
    getIdByUrl(url: string, query?: object): Promise<string | null>;
    getById(id: string): Promise<ImageEntity | null>;
  }

  export interface File {
    getRemote(url: string, query?: object): Promise<Buffer>;
  }
}

export namespace Service {
  export interface Proxy {
    getDestination(url: string, query?: object): Promise<string>;
    getById(id: string): Promise<ImageEntity | null>;
  }
}

export type Services = {
  imageProxy: Service.Proxy;
};

export interface FileFetcher {
  getRemoteAsBuffer(url: string, query?: object): Promise<Buffer>;
}

export interface BackgroundJob<T> {
  schedule(params: T): Promise<void>;
}
