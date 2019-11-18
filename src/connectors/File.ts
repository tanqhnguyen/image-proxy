import { Connector, FileFetcher } from '~types';

type Params = {
  fileFetcher: FileFetcher;
};

export class RemoteFileConnector implements Connector.File {
  private fileFetcher: FileFetcher;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  getRemote(url: string, query?: object): Promise<Buffer> {
    return this.fileFetcher.getRemoteAsBuffer(url);
  }
}
