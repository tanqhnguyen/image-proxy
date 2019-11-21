import { Connection } from 'typeorm';

import { FileConnector } from '~connectors/File';
import { LinkPgConnector } from '~connectors/Link';

import { File } from '~entities/File';
import { Link } from '~entities/Link';

import { Connectors, FileFetcher } from '~types';

type Params = {
  fileFetcher: FileFetcher;
  connection: Connection;
};

export function setupConnectors(params: Params): Connectors {
  const { connection } = params;
  return {
    file: new FileConnector({
      repository: connection.getRepository(File),
      fileFetcher: params.fileFetcher,
    }),
    link: new LinkPgConnector({
      repository: connection.getRepository(Link),
    }),
  };
}
