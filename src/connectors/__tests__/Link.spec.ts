import test from 'ava';
import * as fs from 'fs';
import * as moment from 'moment';

import { Repository } from 'typeorm';
import { Image } from '~entities/Image';
import { Link } from '~entities/Link';

import { ImagePgConnector } from '~connectors/Image';
import { LinkPgConnector } from '~connectors/Link';

import { setupConnection } from '~test/database';

let imageRepository: Repository<Image>;
let linkRepository: Repository<Link>;
let imageConnector: ImagePgConnector;

test.before(async () => {
  const connection = await setupConnection();
  imageRepository = connection.getRepository(Image);
  linkRepository = connection.getRepository(Link);

  imageConnector = new ImagePgConnector({
    repository: imageRepository,
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
