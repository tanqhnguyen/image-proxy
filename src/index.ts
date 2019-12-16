import { createConnection } from 'typeorm';

import { Config } from '~config';
import { setupConnectors } from './connectors/index';
import { setupServices } from './services/index';
import { AxiosHttpRequest } from '~common/HttpRequest';
import { FastifyServer } from './server/fastify';
import { ApiServer } from './server/index';
import { ConsoleLogger, LogLevel } from '~common/Logger';

(async (): Promise<void> => {
  const connection = await createConnection();
  if (!Config.isProduction()) {
    console.time('Synchronizing DB schema');
    await connection.synchronize();
    console.timeEnd('Synchronizing DB schema');
  }

  const connectors = setupConnectors({
    httpRequest: new AxiosHttpRequest(),
    connection,
  });

  const services = setupServices({ connectors });
  const apiServer = new ApiServer({
    services,
    logger: new ConsoleLogger({
      level: Config.log.level as LogLevel,
      label: 'API Server',
    }),
    server: new FastifyServer({ prefix: '/api' }),
  });

  apiServer.start(Config.api.port);
})();
