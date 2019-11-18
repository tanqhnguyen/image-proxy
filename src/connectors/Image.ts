import { Connector, WithoutMetaColumn } from '~types';
import { Image } from '~entities/Image';

import { Repository } from 'typeorm';

type Params = {
  repository: Repository<Image>;
};

export class ImagePgConnector implements Connector.Image {
  private repository: Repository<Image>;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async upsert(image: WithoutMetaColumn<Image>): Promise<Image> {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values(image)
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
}
