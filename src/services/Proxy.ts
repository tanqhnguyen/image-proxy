import { Service, BackgroundJob, Connector } from '~types';
import { normalizeUrl } from '~common/Url';
import { Image } from '~entities/Image';

type Params = {
  importImageBackgroundJob: BackgroundJob<{ url: string }>;
  imageConnector: Connector.Image;
  baseUrl: string;
};

export class ImageProxy implements Service.Proxy {
  private importImageBackgroundJob: BackgroundJob<{
    url: string;
  }>;
  private imageConnector: Connector.Image;
  private baseUrl: string;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async getDestination(url: string): Promise<string> {
    const id = await this.imageConnector.getIdByUrl(url);
    if (!id) {
      await this.importImageBackgroundJob.schedule({ url });
      return url;
    }

    return `${this.baseUrl}/images/${id}`;
  }

  getById(id: string): Promise<Image> {
    return this.imageConnector.getById(id);
  }
}
