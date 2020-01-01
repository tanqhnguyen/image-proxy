import { Connection } from 'typeorm';

import { FileConnector } from '~connectors/File';
import { AccessTokenPgConnector } from '~connectors/AccessToken';

import { File } from '~entities/File';
import { AccessToken } from '~entities/AccessToken';

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
    accessToken: new AccessTokenPgConnector({
      repository: connection.getRepository(AccessToken),
    }),
  };
}
