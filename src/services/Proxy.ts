import { Service, Connector } from '~types';
import { File } from '~entities/File';
import { AccessToken } from '~entities/AccessToken';
import { FileNotFoundError, AccessTokenNotFoundError } from '~common/errors';

interface Params {
  fileConnector: Connector.File;
  accessTokenConnector: Connector.AccessToken;
}

export class RemoteFileProxy implements Service.Proxy {
  private fileConnector: Params['fileConnector'];
  private accessTokenConnector: Params['accessTokenConnector'];

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async importFromUrlIfNotExists(url: string): Promise<File> {
    const file = await this.fileConnector.getByUrl(url);
    if (file) {
      return file;
    }

    const { content, ext, mime } = await this.fileConnector.getRemote(url);

    return this.fileConnector.upsert({
      url,
      mime,
      ext,
      size: content.byteLength,
      content,
    });
  }

  async generateNewAccessTokenIfNotAvailable(
    url: string,
  ): Promise<AccessToken> {
    const file = await this.fileConnector.getByUrl(url);
    if (!file) {
      throw new FileNotFoundError();
    }

    const tokens = await this.accessTokenConnector.getValidByFileId(file.id);
    if (tokens.length) {
      const token = tokens[0];
      token.file = file;
      return token;
    }

    const newToken = await this.accessTokenConnector.generate(file.id);
    newToken.file = file;
    return newToken;
  }

  async getByFileIdAndAccessTokenOrThrow(
    fileId: File['id'],
    accessTokenId: AccessToken['id'],
  ): Promise<File> {
    const token = await this.accessTokenConnector.getByIdWithFile(
      accessTokenId,
    );

    if (!token) {
      throw new AccessTokenNotFoundError();
    }

    if (!token.file || token.file.id !== fileId) {
      throw new FileNotFoundError();
    }

    return token.file;
  }
}
