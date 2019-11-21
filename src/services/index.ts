import { Services, Connectors } from '~types';
import { RemoteFileProxy } from '~services/Proxy';

type Params = {
  connectors: Connectors;
};

export function setupServices(params: Params): Services {
  const { connectors } = params;
  return {
    remoteFile: new RemoteFileProxy({
      fileConnector: connectors.file,
      linkConnector: connectors.link,
    }),
  };
}
