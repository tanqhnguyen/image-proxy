import { Router } from 'express';
import { Services } from '~types';
import { redirectTo, serveStaticFile } from './middlewares';

export function setupImagesRoute(app: Router, services: Services) {
  app.get(
    '/proxy/:url',
    redirectTo<{ url: string }>(params => {
      return services.imageProxy.getDestination(params.url);
    }),
  );

  app.get(
    '/:id',
    serveStaticFile<{ id: string }>(async params => {
      const image = await services.imageProxy.getById(params.id);
      if (!image) {
        throw new Error('Image not found');
      }

      return {
        name: `${image.id}.${image.ext}`,
        mime: image.mime,
        content: image.content,
      };
    }),
  );
}
