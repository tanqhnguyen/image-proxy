import { Image as ImageEntity } from '~entities/Image';

export type WithoutMetaColumn<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export interface Image {
    upsert(image: WithoutMetaColumn<ImageEntity>): Promise<ImageEntity>;
    getByUrl(url: string): Promise<ImageEntity | null>;
  }

  export interface File {
    getRemote(url: string): Promise<Buffer>;
  }
}

export namespace Service {
  export interface Proxy {
    importFromUrlIfNotExists(url: string): Promise<ImageEntity | null>;
  }
}

export type Services = {
  imageProxy: Service.Proxy;
};

export interface FileFetcher {
  getRemoteAsBuffer(url: string): Promise<Buffer>;
}
