import { Connector, FileFetcher } from '~types';

type Params = {
  fileFetcher: FileFetcher;
};

export class RemoteFileConnector implements Connector.File {
  private fileFetcher: FileFetcher;

  constructor(params: Params) {
    Object.assign(this, params);
  }

  getRemote(url: string): Promise<Buffer> {
    return this.fileFetcher.getRemoteAsBuffer(url);
  }
}
