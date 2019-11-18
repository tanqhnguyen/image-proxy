import { createConnection, getRepository } from 'typeorm';

import * as express from 'express';

import { ImagePgConnector } from '~connectors/Image';
import { Image } from '~entities/Image';
import { ImageProxy } from '~services/Proxy';

import { setupImagesRoute } from './routes/images';

(async () => {
  const connection = await createConnection();
  await connection.synchronize();

  const imageConnector = new ImagePgConnector({
    repository: getRepository(Image),
  });

  const services = {
    imageProxy: new ImageProxy({
      baseUrl: 'http://localhost/images',
      imageConnector,
      importImageBackgroundJob: { schedule: async () => {} },
    }),
  };

  const app = express();
  const imagesRouter = setupImagesRoute(express.Router(), services);

  app.use('/images', imagesRouter);
})();
