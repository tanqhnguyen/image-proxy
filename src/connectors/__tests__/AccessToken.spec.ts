import test from 'ava';
import * as fs from 'fs';
import * as moment from 'moment';

import { Repository } from 'typeorm';
import { File } from '~entities/File';
import { AccessToken } from '~entities/AccessToken';

import { FileConnector } from '~connectors/File';
import { AccessTokenPgConnector } from '~connectors/AccessToken';

import { setupConnection } from '~test/database';
import { AxiosHttpRequest } from '~common/HttpRequest';

let imageRepository: Repository<File>;
let accessTokenRepository: Repository<AccessToken>;
let imageConnector: FileConnector;

test.before(async () => {
  const connection = await setupConnection();
  imageRepository = connection.getRepository(File);
  accessTokenRepository = connection.getRepository(AccessToken);

  imageConnector = new FileConnector({
    repository: imageRepository,
    httpRequest: new AxiosHttpRequest(),
  });
});

test('insert a new record', async t => {
  const connector = new AccessTokenPgConnector({
    repository: accessTokenRepository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await imageConnector.upsert({
    url: 'test1',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const token = await connector.generate(image.id);
  const savedToken = await accessTokenRepository.findOne(token.id);

  t.is(moment.utc(savedToken.expiredAt).diff(moment.utc(), 'days'), 6);
});

test('get first valid token', async t => {
  const connector = new AccessTokenPgConnector({
    repository: accessTokenRepository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await imageConnector.upsert({
    url: 'test2',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const token1 = await connector.generate(image.id);
  const token2 = await connector.generate(image.id);

  const valid1 = await connector.getValidByFileId(image.id);

  t.is(valid1.length, 2);
  t.deepEqual(
    [token2.id, token1.id],
    valid1.map(token => token.id),
  );

  token2.expiredAt = moment
    .utc()
    .subtract(7, 'days')
    .toDate();
  await accessTokenRepository.save(token2);
  const valid2 = await connector.getValidByFileId(image.id);

  t.is(valid2.length, 1);
  t.deepEqual(
    [token1.id],
    valid2.map(token => token.id),
  );
});
