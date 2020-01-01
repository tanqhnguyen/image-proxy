import test from 'ava';
import * as nock from 'nock';

import { setupConnectors } from '~connectors/index';
import { setupConnection } from '~test/database';
import { AxiosHttpRequest } from '~common/HttpRequest';
import { setupServices } from '~services/index';
import { FastifyServer } from '../../server/fastify';
import * as fastify from 'fastify';
import { ImagesController } from '../Images';
import { ErrorMessage } from '~common/errors';

let server: fastify.FastifyInstance;
test.before(async () => {
  const connection = await setupConnection();

  const connectors = setupConnectors({
    httpRequest: new AxiosHttpRequest(),
    connection,
  });

  const services = setupServices({ connectors });
  const images = new ImagesController({ services });

  const fastifyServer = new FastifyServer();
  fastifyServer.addController(images);

  server = fastifyServer.serverInstance;

  nock.enableNetConnect('tannguyen.org');
});

test.after.always(async () => {
  try {
    await server.close();
  } catch (e) {
    console.error(e);
  }
});

test('import image from a remote location', async t => {
  const res = await server.inject({
    method: 'POST',
    url: '/images/import',
    payload: {
      url: 'https://tannguyen.org/images/obi-wan-visible-confusion.jpg',
    },
    headers: {
      'x-secret-key': 'z7ZRvQuH5f8hMvCSPtRD7GtP',
    },
  });

  const payload = JSON.parse(res.payload);

  t.is(payload.success, true);
  t.is(payload.error, null);
});

test('must provide secret key to access', async t => {
  const res = await server.inject({
    method: 'POST',
    url: '/images/import',
    payload: {
      url: 'https://tannguyen.org/images/obi-wan-visible-confusion.jpg',
    },
  });

  const payload = JSON.parse(res.payload);

  t.is(payload.success, false);
  t.deepEqual(payload.error, {
    message: ErrorMessage.NOT_FOUND,
    params: null,
  });
});
