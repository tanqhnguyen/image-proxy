import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import 'reflect-metadata';

import { Route, Controller, MethodDecorator, ClassDecorator } from '~types';

const CONTROLLERS: Controller[] = [];
const ROUTES: Route[] = [];

export function Controller(config: Controller['config']): ClassDecorator {
  return constructor => {
    CONTROLLERS.push({
      config,
      cls: constructor,
      name: constructor.name,
    });
  };
}

export function Route(config: Route['config']): MethodDecorator {
  return function(target, propertyKey, descriptor) {
    ROUTES.push({
      controllerName: target.constructor.name,
      config,
      propertyKey,
    });

    return descriptor;
  };
}

function constructRoute(
  route: Route,
  controller: any,
  prefix: string,
): fastify.RouteOptions {
  const {
    propertyKey,
    config: { method, url, input, output },
  } = route;

  return {
    method: method.toUpperCase() as any,
    url: `${prefix}${url}`,
    schema: {
      ...(input || {}),
      response: {
        xxx: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: ['object', 'null'],
              properties: {
                message: { type: 'string' },
                params: { type: ['object', 'null'] },
              },
            },
            data: output || {},
          },
        },
      },
    },
    handler: async (
      request: fastify.FastifyRequest,
      reply: fastify.FastifyReply<ServerResponse>,
    ) => {
      const params = {
        ...(request.query || {}),
        ...(request.body || {}),
        ...(request.params || {}),
      };

      const result = await controller[propertyKey](params);
      reply.send({ success: true, data: result, error: null });
    },
  };
}

export class FastifyServer {
  private server: fastify.FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  >;

  get serverInstance() {
    return this.server;
  }

  constructor(params?: {}) {
    Object.assign(this, params || {});

    this.server = fastify({
      logger: true,
    });

    this.server.setErrorHandler(function(error, request, reply) {
      if (error.validation) {
        reply.status(400).send({
          success: false,
          data: null,
          error: {
            message: 'Invalid data',
            params: {
              rules: error.validation,
            },
          },
        });
      } else {
        const statusCode = error.statusCode || 500;
        reply.status(statusCode).send({
          success: false,
          data: null,
          error:
            statusCode < 500
              ? error
              : {
                  message: 'Internal error',
                  params: null,
                },
        });
      }
    });
  }

  addController(controller: any, options?: { prefix: string }) {
    const { prefix = '' } = options || {};

    const definedController = CONTROLLERS.find(({ cls }) => {
      return controller instanceof cls;
    });

    if (!definedController) {
      throw new Error('Is the controller decorated with @Controller?');
    }

    const { config } = definedController;

    const routeOptions = ROUTES.filter(
      route => route.controllerName === definedController.name,
    ).map(route => {
      return constructRoute(route, controller, `${prefix}${config.prefix}`);
    });

    if (!routeOptions.length) {
      throw new Error(
        `Can't find any route defined in this controller. Make sure the route is decorated with @Route`,
      );
    }

    routeOptions.forEach(opts => {
      this.server.route(opts);
    });
  }

  listen(port: number) {
    this.server.listen(port);
  }
}
