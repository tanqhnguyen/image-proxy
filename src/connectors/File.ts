import { Connector, FileFetcher } from '~types';
import { File } from '~entities/File';

import * as crypto from 'crypto';
import * as mime from 'mime';

import { Repository } from 'typeorm';

type Params = {
  repository: Repository<File>;
  fileFetcher: FileFetcher;
};

export class FileConnector implements Connector.File {
  private repository: Repository<File>;
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

  async upsert(file: Connector.FileUpsertParams): Promise<File> {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .into(File)
      .values({
        ...file,
        id: this.constructId(file.url),
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
    const file = await this.repository.findOne(this.constructId(url), {
      select: ['id'],
    });

    return file ? file.id : null;
  }

  getByUrl(url: string): Promise<File> {
    return this.repository.findOne(this.constructId(url));
  }

  private extractFileExtension(
    url: string,
  ): { name: string; ext: string; mime: string } {
    const urlObject = new URL(url);
    const { pathname } = urlObject;
    const parts = pathname.split('/');

    const [fileName, fileExt] = parts.slice(-1)[0].split('.');

    return {
      name: fileName,
      ext: fileExt,
      mime: mime.getType(fileExt),
    };
  }

  async getRemote(
    url: string,
  ): Promise<{ content: Buffer; name: string; ext: string; mime: string }> {
    const content = await this.fileFetcher.getRemoteAsBuffer(url);

    return {
      ...this.extractFileExtension(url),
      content,
    };
  }
}
