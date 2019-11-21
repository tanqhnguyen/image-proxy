import { Connector, FileFetcher } from '~types';
import { Image } from '~entities/Image';

import * as crypto from 'crypto';

import { Repository } from 'typeorm';

type Params = {
  repository: Repository<Image>;
  fileFetcher: FileFetcher;
};

export class ImagePgConnector implements Connector.Image {
  private repository: Repository<Image>;
  private fileFetcher: FileFetcher;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  private constructId(url: string): string {
    return crypto
      .createHash('md5')
      .update(url)
      .digest('hex');
  }

  async upsert(image: Connector.ImageUpsertParams): Promise<Image> {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        ...image,
        id: this.constructId(image.url),
      })
      .onConflict(
        `("id") DO UPDATE SET
        "mime" = EXCLUDED.mime,
        "ext" = EXCLUDED.ext,
        "size" = EXCLUDED.size,
        "content" = EXCLUDED.content,
        "updatedAt" = NOW()
      `,
      )
      .returning('*')
      .execute();

    const [row] = result.raw;
    if (!row) {
      throw new Error('Failed to upsert image');
    }

    return row;
  }

  async getIdByUrl(url: string): Promise<string | null> {
    const image = await this.repository.findOne(this.constructId(url), {
      select: ['id'],
    });

    return image ? image.id : null;
  }

  getByUrl(url: string): Promise<Image> {
    return this.repository.findOne(this.constructId(url));
  }

  getRemote(url: string): Promise<Buffer> {
    return this.fileFetcher.getRemoteAsBuffer(url);
  }
}
