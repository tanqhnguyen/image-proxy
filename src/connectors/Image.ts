import { Connector, WithoutMetaColumn } from '~types';
import { Image } from '~entities/Image';

import * as crypto from 'crypto';

import { Repository } from 'typeorm';
import { normalizeUrl } from '~common/Url';

type Params = {
  repository: Repository<Image>;
};

export class ImagePgConnector implements Connector.Image {
  private repository: Repository<Image>;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  private constructId(url: string): string {
    return crypto
      .createHash('md5')
      .update(url)
      .digest('hex');
  }

  async upsert(image: WithoutMetaColumn<Image>): Promise<Image> {
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

  async getIdByUrl(url: string, query?: object): Promise<string | null> {
    const image = await this.repository.findOne(
      this.constructId(normalizeUrl(url, query)),
      {
        select: ['id'],
      },
    );

    return image ? image.id : null;
  }
}
