import { Service, Connector } from '~types';
import { File } from '~entities/File';
import { extractFileExtension } from '~common/Url';
import { Link } from '~entities/Link';

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

    const content = await this.fileConnector.getRemote(url);
    const { ext, mime } = extractFileExtension(url);

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
      throw new Error('Image not found');
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
}
