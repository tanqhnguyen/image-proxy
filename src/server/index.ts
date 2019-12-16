import { Services } from '~types';
import { FastifyServer } from './fastify';

export { Route, Controller } from './fastify';

import { ImagesController } from '~controllers/Images';

export function start(params: { services: Services; port: number }) {
  const { services, port } = params;
  const server = new FastifyServer({ prefix: '/api' });

  server.addController(new ImagesController({ services }), { prefix: '/v1' });
  server.listen(port);
}
