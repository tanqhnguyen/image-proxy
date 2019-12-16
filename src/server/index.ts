import { Services, Logger, WebServer } from '~types';

export { Route, Controller } from './fastify';

import { ImagesController } from '~controllers/Images';

export class ApiServer {
  private logger: Logger;
  private services: Services;
  private server: WebServer.Server;

  constructor(params: {
    logger: Logger;
    services: Services;
    server: WebServer.Server;
  }) {
    Object.assign(this, params);

    const { services } = params;

    this.server.addController(new ImagesController({ services }), {
      prefix: '/v1',
    });
  }

  start(port: number, host?: string) {
    const h = host || '0.0.0.0';
    this.server.listen(port, h);
    this.logger.info(`Started API server at ${h}:${port}`);
  }
}
