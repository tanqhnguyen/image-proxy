import test from 'ava';
import * as nock from 'nock';

import { ImageProxy } from '~services/Proxy';
import { setupConnectors } from '~connectors/index';

import { setupConnection } from '~test/database';
import { Connectors } from '~types';
import { AxiosFileFetcher } from '~common/FileFetcher';

let connectors: Connectors;
let service: ImageProxy;
test.before(async () => {
  const connection = await setupConnection();
  connectors = setupConnectors({
    fileFetcher: new AxiosFileFetcher(),
    connection,
  });

  service = new ImageProxy({
    fileConnector: connectors.file,
    imageConnector: connectors.image,
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
