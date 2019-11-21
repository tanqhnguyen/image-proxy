import { Connection } from 'typeorm';

import { RemoteFileConnector } from '~connectors/File';
import { ImagePgConnector } from '~connectors/Image';
import { LinkPgConnector } from '~connectors/Link';

import { Image } from '~entities/Image';
import { Link } from '~entities/Link';

import { Connectors, FileFetcher } from '~types';

type Params = {
  fileFetcher: FileFetcher;
  connection: Connection;
};

export function setupConnectors(params: Params): Connectors {
  const { connection } = params;
  return {
    image: new ImagePgConnector({
      repository: connection.getRepository(Image),
    }),
    link: new LinkPgConnector({
      repository: connection.getRepository(Link),
    }),
    file: new RemoteFileConnector({
      fileFetcher: params.fileFetcher,
    }),
  };
}
