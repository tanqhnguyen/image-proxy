import test from 'ava';
import * as nock from 'nock';

import { RemoteFileProxy } from '~services/Proxy';
import { setupConnectors } from '~connectors/index';

import { setupConnection } from '~test/database';
import { Connectors } from '~types';
import { AxiosHttpRequest } from '~common/HttpRequest';
import { FileNotFoundError, ErrorMessage } from '~common/errors';

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

  nock.enableNetConnect('tannguyen.org');
});

test('import image from a remote location', async t => {
  const image = await service.importFromUrlIfNotExists(
    'https://tannguyen.org/images/obi-wan-visible-confusion.jpg',
  );

  t.is(image.ext, 'jpg');
  t.is(image.mime, 'image/jpeg');
});

test('return a valid link to the file', async t => {
  const url = 'https://tannguyen.org/images/success-kid.jpg';
  const image = await service.importFromUrlIfNotExists(url);
  const link = await service.generateNewLinkIfNotAvailable(url);
  t.is(link.file.id, image.id);
});

test('handle invalid file', async t => {
  await t.throwsAsync(
    async () => {
      await service.generateNewLinkIfNotAvailable('not-exist');
    },
    {
      instanceOf: FileNotFoundError,
      message: ErrorMessage.FILE_NOT_FOUND,
    },
  );
});
