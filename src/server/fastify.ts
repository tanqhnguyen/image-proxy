import fastify from 'fastify';
import crypto from 'crypto';
import moment from 'moment';
import { Server, IncomingMessage, ServerResponse } from 'http';

import { WebServer, MethodDecorator, ClassDecorator, Streamable } from '~types';
import { NotFoundError } from '~common/errors';

const CONTROLLERS: WebServer.Controller[] = [];
const ROUTES: WebServer.Route[] = [];

export function Controller(
  config: WebServer.Controller['config'],
): ClassDecorator {
  return constructor => {
    CONTROLLERS.push({
      config,
      cls: constructor,
      name: constructor.name,
    });
  };
}

export function Route(config: WebServer.Route['config']): MethodDecorator {
  return function(target, propertyKey, descriptor) {
    ROUTES.push({
      controllerName: target.constructor.name,
      config,
      propertyKey,
    });

    return descriptor;
  };
}

export class FastifyServer implements WebServer.Server {
  private prefix: string;

  private server: fastify.FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  >;

  get serverInstance() {
    return this.server;
  }

  private async verifyRequest(
    auth: WebServer.AuthStrategy[],
    requestParams: object,
    headers: object,
  ) {
    for (const strategy of auth) {
      const result = await strategy.verify(requestParams, headers);
      if (!result) {
        throw new NotFoundError();
      }
    }
  }

  private constructRoute(
    route: WebServer.Route,
    controller: any,
    prefix: string,
  ): fastify.RouteOptions {
    const {
      propertyKey,
      config: {
        method,
        url,
        requestSchema,
        responseSchema,
        responseType = 'json',
        auth = null,
      },
    } = route;

    return {
      method: method.toUpperCase() as any,
      url: `${prefix}${url}`,
      schema: {
        ...(requestSchema || {}),
        response:
          responseType === 'json'
            ? {
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
                    data: responseSchema || {},
                  },
                },
              }
            : {},
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

        if (auth && auth.length) {
          await this.verifyRequest(auth, params, request.headers);
        }

        //  call the controller method
        const result = await controller[propertyKey](params, request.headers);

        if (responseType === 'json') {
          reply.send({ success: true, data: result, error: null });
        } else if (responseType === 'binary') {
          const streamable: Streamable = result;
          const format = 'ddd, DD MMM YYYY HH:mm:ss [GMT]';
          const etag = crypto
            .createHash('md5')
            .update(streamable.fileName)
            .digest('hex');

          const ifNonMatch = request.headers['if-none-match'];
          const ifModifiedSince = request.headers['if-modified-since'];

          if (
            (ifNonMatch && ifNonMatch === etag) ||
            (ifModifiedSince &&
              moment
                .utc(ifModifiedSince, format)
                .diff(moment.utc(streamable.lastModified, format), 'seconds') >=
                0)
          ) {
            reply.status(304);
            reply.send(null);
          } else {
            reply.headers({
              Etag: etag,
              'Content-Type': streamable.mime,
              'Content-Length': streamable.size,
              'Cache-Control': 'max-age=31536000',
              'Last-Modified': moment
                .utc(streamable.lastModified)
                .format(format),
              Expires: moment
                .utc()
                .add(1, 'year')
                .format(format),
            });
            reply.send(streamable.content);
          }
        } else {
          throw new Error(`[${responseType}] is not supported`);
        }
      },
    };
  }

  private handleError(error, request, reply) {
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

      // TODO: Have a proper log solution here
      if (statusCode === 500) {
        console.error(error);
      }

      reply.status(statusCode).send({
        success: false,
        data: null,
        error:
          statusCode < 500
            ? {
                message: error.message,
                params: error.params,
              }
            : {
                message: 'Internal error',
                params: null,
              },
      });
    }
  }

  constructor(params?: Partial<{ prefix: string }>) {
    Object.assign(this, params || {});

    this.server = fastify({
      logger: true,
    });

    this.server.setErrorHandler(this.handleError);
  }

  addController(controller: any, options?: Partial<{ prefix: string }>): void {
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
      return this.constructRoute(
        route,
        controller,
        `${this.prefix || ''}${prefix}${config.prefix}`,
      );
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

  listen(port: number, host?: string): void {
    this.server.listen(port, host);
  }
}
