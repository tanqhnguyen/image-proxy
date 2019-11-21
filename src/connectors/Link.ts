import { Connector } from '~types';
import { Link } from '~entities/Link';
import { File } from '~entities/File';

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
    fileId: File['id'],
    ttl: number = ONE_WEEK_IN_SECONDS,
  ): Promise<Link> {
    const file = new File();
    file.id = fileId;

    const result = await this.repository.insert({
      file: file,
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

  async getValidByFileId(fileId: File['id']): Promise<Link[]> {
    const file = new File();
    file.id = fileId;

    const result = await this.repository.find({
      where: {
        file,
        expiredAt: Raw(alias => `${alias} > NOW()`),
      },
      order: {
        expiredAt: 'DESC',
      },
    });

    return result;
  }
}
