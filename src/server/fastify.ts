import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import 'reflect-metadata';

import {
  Route,
  Controller,
  MethodDecorator,
  ClassDecorator,
  Services,
} from '~types';

const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  logger: true,
});

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
      name: target.constructor.name,
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
  private services: Services;
  constructor(params: { services: Services }) {
    Object.assign(this, params);
  }
}

export function bootstrap(
  controllers: Object[],
  globalParams?: { prefix: string },
): fastify.FastifyInstance {
  const { prefix: globalPrefix = '' } = globalParams || {};

  controllers.forEach(controller => {
    CONTROLLERS.forEach(({ cls, name, config }) => {
      if (!(controller instanceof cls)) {
        return;
      }

      ROUTES.filter(route => route.name === name).forEach(route => {
        server.route(
          constructRoute(route, controller, `${globalPrefix}${config.prefix}`),
        );
      });
    });
  });

  server.setErrorHandler(function(error, request, reply) {
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

  return server;
}
