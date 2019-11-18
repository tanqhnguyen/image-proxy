import { createConnection, getRepository } from 'typeorm';

import * as express from 'express';

import { setupImagesRoute } from './routes/images';

import { Config } from '~config';
import { setupConnectors } from './connectors/index';
import { setupServices } from './services/index';
import { AxiosFileFetcher } from '~common/FileFetcher';

(async (): Promise<void> => {
  const connection = await createConnection();
  if (!Config.isProduction()) {
    console.time('Synchronizing DB schema');
    await connection.synchronize();
    console.timeEnd('Synchronizing DB schema');
  }

  const connectors = setupConnectors({
    fileFetcher: new AxiosFileFetcher(),
  });

  const services = setupServices({ connectors });

  const app = express();
  const imagesRouter = setupImagesRoute(express.Router(), services);

  app.use('/images', imagesRouter);

  app.listen(Config.api.port, '0.0.0.0', () => {
    console.log(`API is running at port ${Config.api.port}`);
  });
})();
