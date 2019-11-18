import { Service, BackgroundJob, Connector } from '~types';
import { normalizeUrl } from '../common/Url';

type Params = {
  importImageBackgroundJob: BackgroundJob<{ url: string; query?: object }>;
  imageConnector: Connector.Image;
  baseUrl: string;
};

export class ImageProxy implements Service.Proxy {
  private importImageBackgroundJob: BackgroundJob<{
    url: string;
    query?: object;
  }>;
  private imageConnector: Connector.Image;
  private baseUrl: string;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  async getDestination(url: string, query?: object): Promise<string> {
    const id = await this.imageConnector.getIdByUrl(url, query);
    if (!id) {
      await this.importImageBackgroundJob.schedule({ url, query });
      return normalizeUrl(url, query);
    }

    return `${this.baseUrl}/images/${id}`;
  }
}
