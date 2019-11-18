import { getRepository } from 'typeorm';

import { RemoteFileConnector } from '~connectors/File';
import { ImagePgConnector } from '~connectors/Image';
import { Image } from '~entities/Image';
import { Connectors, FileFetcher } from '~types';

type Params = {
  fileFetcher: FileFetcher;
};

export function setupConnectors(params: Params): Connectors {
  return {
    image: new ImagePgConnector({
      repository: getRepository(Image),
    }),
    file: new RemoteFileConnector({
      fileFetcher: params.fileFetcher,
    }),
  };
}
