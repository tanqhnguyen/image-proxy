import { Connector } from '~types';
import { Link } from '~entities/Link';
import { Image } from '~entities/Image';

import * as moment from 'moment';

import { Repository, Raw } from 'typeorm';

type Params = {
  repository: Repository<Link>;
};

const ONE_WEEK_IN_SECONDS = 604800;

export class LinkPgConnector implements Connector.Link {
  private repository: Repository<Link>;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async generate(
    imageId: Image['id'],
    ttl: number = ONE_WEEK_IN_SECONDS,
  ): Promise<Link> {
    const image = new Image();
    image.id = imageId;

    const result = await this.repository.insert({
      image,
      expiredAt: moment
        .utc()
        .add(ttl, 'seconds')
        .toDate(),
    });

    const link = result.raw[0];

    if (!link) {
      throw new Error('Failed to insert');
    }

    return link;
  }

  async getValidByImageId(imageId: Image['id']): Promise<Link[]> {
    const image = new Image();
    image.id = imageId;

    const result = await this.repository.find({
      where: {
        image,
        expiredAt: Raw(alias => `${alias} > NOW()`),
      },
      order: {
        expiredAt: 'DESC',
      },
    });

    return result;
  }
}
