import test from 'ava';
import * as nock from 'nock';
import * as moment from 'moment';

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
    accessTokenConnector: connectors.accessToken,
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

test('return a valid token to the file', async t => {
  const url = 'https://tannguyen.org/images/success-kid.jpg';
  const image = await service.importFromUrlIfNotExists(url);
  const token = await service.generateNewAccessTokenIfNotAvailable(url);
  t.is(token.file.id, image.id);
});

test('handle invalid file', async t => {
  await t.throwsAsync(
    async () => {
      await service.generateNewAccessTokenIfNotAvailable('not-exist');
    },
    {
      instanceOf: FileNotFoundError,
      message: ErrorMessage.FILE_NOT_FOUND,
    },
  );
});

test('get image by id and access token', async t => {
  const url = 'https://tannguyen.org/images/success-kid.jpg';
  const image = await service.importFromUrlIfNotExists(url);
  const token = await service.generateNewAccessTokenIfNotAvailable(url);

  const validImage = await service.getByFileIdAndAccessTokenOrThrow(
    image.id,
    token.id,
  );
  t.is(validImage.id, image.id);

  await connectors.accessToken.setExpirationDateById(
    token.id,
    moment
      .utc()
      .subtract(1, 'day')
      .toDate(),
  );

  await t.throwsAsync(
    async () => {
      await service.getByFileIdAndAccessTokenOrThrow(image.id, token.id);
    },
    { instanceOf: FileNotFoundError },
  );
});
