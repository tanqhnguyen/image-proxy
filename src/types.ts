import { Image as ImageEntity } from '~entities/Image';
import { Link as LinkEntity } from '~entities/Link';

export type WithoutMetaColumn<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export type ImageUpsertParams = Omit<WithoutMetaColumn<ImageEntity>, 'links'>;
  export interface Image {
    upsert(image: ImageUpsertParams): Promise<ImageEntity>;
    getByUrl(url: string): Promise<ImageEntity | null>;
    getRemote(url: string): Promise<Buffer>;
  }

  export interface Link {
    generate(imageId: ImageEntity['id'], ttl?: number): Promise<LinkEntity>;
    getValidByImageId(imageId: ImageEntity['id']): Promise<LinkEntity[]>;
  }
}

export namespace Service {
  export interface Proxy {
    importFromUrlIfNotExists(url: string): Promise<ImageEntity | null>;
    generateNewLinkIfNotAvailable(url: string): Promise<LinkEntity>;
  }
}

export type Services = {
  imageProxy: Service.Proxy;
};

export type Connectors = {
  image: Connector.Image;
  link: Connector.Link;
};

export interface FileFetcher {
  getRemoteAsBuffer(url: string): Promise<Buffer>;
}
