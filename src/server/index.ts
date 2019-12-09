import { Services } from '~types';
import { bootstrap } from './fastify';

export { Route, Controller } from './fastify';

import { ImagesController } from '~controllers/Images';

export function start(services: Services) {
  const images = new ImagesController({ services });

  const server = bootstrap([images], { prefix: '/v1' });
  server.listen(3000);
}
