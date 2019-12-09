import { Services } from '~types';
import { FastifyServer } from './fastify';

export { Route, Controller } from './fastify';

import { ImagesController } from '~controllers/Images';

export function start(services: Services) {
  const server = new FastifyServer({ prefix: '/api' });

  server.addController(new ImagesController({ services }), { prefix: '/v1' });
  server.listen(3000);
}
