import test from 'ava';
import * as fs from 'fs';
import * as moment from 'moment';

import { Repository } from 'typeorm';
import { File } from '~entities/File';
import { Link } from '~entities/Link';

import { FileConnector } from '~connectors/File';
import { LinkPgConnector } from '~connectors/Link';

import { setupConnection } from '~test/database';
import { AxiosFileFetcher } from '~common/FileFetcher';

let imageRepository: Repository<File>;
let linkRepository: Repository<Link>;
let imageConnector: FileConnector;

test.before(async () => {
  const connection = await setupConnection();
  imageRepository = connection.getRepository(File);
  linkRepository = connection.getRepository(Link);

  imageConnector = new FileConnector({
    repository: imageRepository,
    fileFetcher: new AxiosFileFetcher(),
  });
});

test('insert a new record', async t => {
  const connector = new LinkPgConnector({
    repository: linkRepository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await imageConnector.upsert({
    url: 'test1',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const link = await connector.generate(image.id);
  const savedLink = await linkRepository.findOne(link.id);

  t.is(moment.utc(savedLink.expiredAt).diff(moment.utc(), 'days'), 6);
});

test('get first valid link', async t => {
  const connector = new LinkPgConnector({
    repository: linkRepository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await imageConnector.upsert({
    url: 'test2',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const link1 = await connector.generate(image.id);
  const link2 = await connector.generate(image.id);

  const valid1 = await connector.getValidByFileId(image.id);

  t.is(valid1.length, 2);
  t.deepEqual(
    [link2.id, link1.id],
    valid1.map(link => link.id),
  );

  link2.expiredAt = moment
    .utc()
    .subtract(7, 'days')
    .toDate();
  await linkRepository.save(link2);
  const valid2 = await connector.getValidByFileId(image.id);

  t.is(valid2.length, 1);
  t.deepEqual(
    [link1.id],
    valid2.map(link => link.id),
  );
});
