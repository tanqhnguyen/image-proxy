import { createConnection, getRepository } from 'typeorm';

import * as express from 'express';

import { ImagePgConnector } from '~connectors/Image';
import { Image } from '~entities/Image';
import { ImageProxy } from '~services/Proxy';

import { setupImagesRoute } from './routes/images';
import { RemoteFileConnector } from '~connectors/File';
import { AxiosFileFetcher } from '~common/FileFetcher';

import { Config } from '~config';

(async (): Promise<void> => {
  const connection = await createConnection();
  if (!Config.isProduction()) {
    console.time('Synchronizing DB schema');
    await connection.synchronize();
    console.timeEnd('Synchronizing DB schema');
  }

  const imageConnector = new ImagePgConnector({
    repository: getRepository(Image),
  });

  const fileConnector = new RemoteFileConnector({
    fileFetcher: new AxiosFileFetcher(),
  });

  const services = {
    imageProxy: new ImageProxy({
      imageConnector,
      fileConnector,
    }),
  };

  const app = express();
  const imagesRouter = setupImagesRoute(express.Router(), services);

  app.use('/images', imagesRouter);

  app.listen(Config.api.port, '0.0.0.0', () => {
    console.log(`API is running at port ${Config.api.port}`);
  });
})();
