import {
  Services,
  Logger,
  WebServer,
  MethodDecorator,
  ClassDecorator,
  ControllerConfig,
  RouteConfig,
} from '~types';

import { ImagesController } from '~controllers/Images';

export function Controller(config: ControllerConfig): ClassDecorator {
  return constructor => {
    constructor.controller = config;
  };
}

export function Route(config: RouteConfig): MethodDecorator {
  return function(target, propertyKey, descriptor) {
    target.constructor.routes = target.constructor.routes || [];
    target.constructor.routes.push({
      config,
      propertyKey,
    });

    return descriptor;
  };
}

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
