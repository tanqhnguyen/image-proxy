import { Connection } from 'typeorm';

import { FileConnector } from '~connectors/File';
import { LinkPgConnector } from '~connectors/Link';

import { File } from '~entities/File';
import { Link } from '~entities/Link';

import { Connectors, HttpRequest } from '~types';

type Params = {
  httpRequest: HttpRequest;
  connection: Connection;
};

export function setupConnectors(params: Params): Connectors {
  const { connection } = params;
  return {
    file: new FileConnector({
      repository: connection.getRepository(File),
      httpRequest: params.httpRequest,
    }),
    link: new LinkPgConnector({
      repository: connection.getRepository(Link),
    }),
  };
}
