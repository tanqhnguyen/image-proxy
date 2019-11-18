import { Service, Connector } from '~types';
import { Image } from '~entities/Image';
import { extractFileExtension } from '~common/Url';

type Params = {
  fileConnector: Connector.File;
  imageConnector: Connector.Image;
};

export class ImageProxy implements Service.Proxy {
  private fileConnector: Connector.File;
  private imageConnector: Connector.Image;

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
}
