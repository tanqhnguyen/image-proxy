import { Service, Connector } from '~types';
import { Image } from '~entities/Image';
import { extractFileExtension } from '~common/Url';
import { Link } from '~entities/Link';

type Params = {
  fileConnector: Connector.File;
  imageConnector: Connector.Image;
  linkConnector: Connector.Link;
};

export class ImageProxy implements Service.Proxy {
  private fileConnector: Connector.File;
  private imageConnector: Connector.Image;
  private linkConnector: Connector.Link;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async importFromUrlIfNotExists(url: string): Promise<Image> {
    const image = await this.imageConnector.getByUrl(url);
    if (image) {
      return image;
    }

    const content = await this.fileConnector.getRemote(url);
    const { ext, mime } = extractFileExtension(url);

    return this.imageConnector.upsert({
      url,
      mime,
      ext,
      size: content.byteLength,
      content,
    });
  }

  async generateNewLinkIfNotAvailable(url: string): Promise<Link> {
    const image = await this.imageConnector.getByUrl(url);
    if (!image) {
      throw new Error('Image not found');
    }

    const links = await this.linkConnector.getValidByImageId(image.id);
    if (links.length) {
      const link = links[0];
      link.image = image;
      return link;
    }

    const generatedLink = await this.linkConnector.generate(image.id);
    generatedLink.image = image;
    return generatedLink;
  }
}
