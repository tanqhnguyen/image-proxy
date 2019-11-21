import test from 'ava';
import * as nock from 'nock';

import { RemoteFileProxy } from '~services/Proxy';
import { setupConnectors } from '~connectors/index';

import { setupConnection } from '~test/database';
import { Connectors } from '~types';
import { AxiosHttpRequest } from '~common/HttpRequest';

let connectors: Connectors;
let service: RemoteFileProxy;
test.before(async () => {
  const connection = await setupConnection();
  connectors = setupConnectors({
    httpRequest: new AxiosHttpRequest(),
    connection,
  });

  service = new RemoteFileProxy({
    fileConnector: connectors.file,
    linkConnector: connectors.link,
  });

  nock.enableNetConnect('image.shutterstock.com');
});

test('import image from a remote location', async t => {
  const image = await service.importFromUrlIfNotExists(
    'https://image.shutterstock.com/image-vector/sign-button-free-icon-260nw-1039733560.jpg',
  );

  t.is(image.ext, 'jpg');
  t.is(image.mime, 'image/jpeg');
});
