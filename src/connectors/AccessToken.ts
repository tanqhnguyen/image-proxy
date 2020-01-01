import { Connector } from '~types';
import { AccessToken } from '~entities/AccessToken';
import { File } from '~entities/File';

import * as moment from 'moment';

import { Repository, Raw } from 'typeorm';

type Params = {
  repository: Repository<AccessToken>;
};

const ONE_WEEK_IN_SECONDS = 604800;

export class AccessTokenPgConnector implements Connector.AccessToken {
  private repository: Repository<AccessToken>;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async generate(
    fileId: File['id'],
    ttl: number = ONE_WEEK_IN_SECONDS,
  ): Promise<AccessToken> {
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

  async getValidByFileId(fileId: File['id']): Promise<AccessToken[]> {
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

  async getByIdWithFile(id: AccessToken['id']): Promise<AccessToken | null> {
    return this.repository.findOne(id, { relations: ['file'] });
  }

  async setExpirationDateById(
    id: AccessToken['id'],
    date: Date,
  ): Promise<boolean> {
    const updateResult = await this.repository.update(
      { id },
      { expiredAt: date },
    );

    return updateResult.affected === 1;
  }
}
