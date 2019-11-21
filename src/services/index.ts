import { Services, Connectors } from '~types';
import { ImageProxy } from '~services/Proxy';

type Params = {
  connectors: Connectors;
};

export function setupServices(params: Params): Services {
  const { connectors } = params;
  return {
    imageProxy: new ImageProxy({
      imageConnector: connectors.image,
      linkConnector: connectors.link,
    }),
  };
}
