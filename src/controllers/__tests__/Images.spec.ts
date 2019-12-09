import test from 'ava';
import * as nock from 'nock';

import { setupConnectors } from '~connectors/index';
import { setupConnection } from '~test/database';
import { AxiosHttpRequest } from '~common/HttpRequest';
import { setupServices } from '~services/index';
import { bootstrap } from '../../server/fastify';
import * as fastify from 'fastify';
import { ImagesController } from '../Images';

let server: fastify.FastifyInstance;
test.before(async () => {
  const connection = await setupConnection();

  const connectors = setupConnectors({
    httpRequest: new AxiosHttpRequest(),
    connection,
  });

  const services = setupServices({ connectors });
  const images = new ImagesController({ services });

  server = bootstrap([images]);

  nock.enableNetConnect('tannguyen.org');
});

test.after.always(async () => {
  await server.close();
});

test('import image from a remote location', async t => {
  const res = await server.inject({
    method: 'POST',
    url: '/images/import',
    payload: {
      url: 'https://tannguyen.org/images/obi-wan-visible-confusion.jpg',
    },
  });

  const payload = JSON.parse(res.payload);

  t.is(payload.success, true);
  t.is(payload.error, null);
});
