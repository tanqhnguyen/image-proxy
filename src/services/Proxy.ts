import { Service, Connector } from '~types';
import { File } from '~entities/File';
import { Link } from '~entities/Link';
import { FileNotFoundError, LinkNotFoundError } from '~common/errors';

interface Params {
  fileConnector: Connector.File;
  linkConnector: Connector.Link;
}

export class RemoteFileProxy implements Service.Proxy {
  private fileConnector: Params['fileConnector'];
  private linkConnector: Params['linkConnector'];

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

  async generateNewLinkIfNotAvailable(url: string): Promise<Link> {
    const file = await this.fileConnector.getByUrl(url);
    if (!file) {
      throw new FileNotFoundError();
    }

    const links = await this.linkConnector.getValidByFileId(file.id);
    if (links.length) {
      const link = links[0];
      link.file = file;
      return link;
    }

    const generatedLink = await this.linkConnector.generate(file.id);
    generatedLink.file = file;
    return generatedLink;
  }

  async getByLinkIdOrThrow(id: Link['id']): Promise<File> {
    const link = await this.linkConnector.getByIdWithFile(id);
    if (!link) {
      throw new LinkNotFoundError();
    }

    if (!link.file) {
      throw new FileNotFoundError();
    }

    return link.file;
  }
}
