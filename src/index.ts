import { createConnection, getRepository } from 'typeorm';

import * as express from 'express';

import { ImagePgConnector } from '~connectors/Image';
import { Image } from '~entities/Image';
import { ImageProxy } from '~services/Proxy';

import { setupImagesRoute } from './routes/images';
import { RemoteFileConnector } from '~connectors/File';
import { AxiosFileFetcher } from '~common/FileFetcher';

(async () => {
  const connection = await createConnection();
  await connection.synchronize();

  const imageConnector = new ImagePgConnector({
    repository: getRepository(Image),
  });

  const fileConnector = new RemoteFileConnector({
    fileFetcher: new AxiosFileFetcher(),
  });

  const services = {
    imageProxy: new ImageProxy({
      baseUrl: 'http://localhost/images',
      imageConnector,
      fileConnector,
    }),
  };

  const app = express();
  const imagesRouter = setupImagesRoute(express.Router(), services);

  app.use('/images', imagesRouter);

  app.listen(3000, () => {
    console.log('Started!');
  });
})();
