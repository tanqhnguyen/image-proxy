import { Image as ImageEntity } from '~entities/Image';

export type WithoutMetaColumn<T> = Omit<T, 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export interface Image {
    upsert(image: WithoutMetaColumn<ImageEntity>): Promise<ImageEntity>;
  }
}
