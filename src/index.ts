import { createConnection } from 'typeorm';

import { Config } from '~config';
import { setupConnectors } from './connectors/index';
import { setupServices } from './services/index';
import { AxiosHttpRequest } from '~common/HttpRequest';
import { start } from './server';

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
  start({ services, port: Config.api.port });
})();
