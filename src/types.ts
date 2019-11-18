import { Image as ImageEntity } from '~entities/Image';

export type WithoutMetaColumn<T> = Omit<T, 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export interface Image {
    upsert(image: WithoutMetaColumn<ImageEntity>): Promise<ImageEntity>;
  }

  export interface File {
    getRemote(url: string, query?: object): Promise<Buffer>;
  }
}

export interface FileFetcher {
  getRemoteAsBuffer(url: string, query?: object): Promise<Buffer>;
}
