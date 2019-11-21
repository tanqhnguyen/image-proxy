import { Router } from 'express';
import { Services } from '~types';
import { serveStaticFile } from './middlewares';

export function setupImagesRoute(router: Router, services: Services): Router {
  router.get(
    '/',
    serveStaticFile<{ url: string }>(async params => {
      const image = await services.remoteFile.importFromUrlIfNotExists(
        params.url,
      );
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

  return router;
}
