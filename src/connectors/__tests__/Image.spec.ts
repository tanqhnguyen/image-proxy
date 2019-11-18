import test from 'ava';

import { createConnection, getRepository } from 'typeorm';
import { Image } from '~entities/Image';
import { ImagePgConnector } from '~connectors/Image';
import * as fs from 'fs';

test.before(async () => {
  const connection = await createConnection();
  await connection.synchronize();
});

test.after.always(async () => {
  await getRepository(Image).clear();
});

test('insert a new record', async t => {
  const repository = getRepository(Image);
  const connector = new ImagePgConnector({
    repository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    id: 'test1',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const savedImage = await repository.findOne(image.id);

  t.is(file.compare(savedImage.content), 0);
});

test('update an existing record but keep the content', async t => {
  const repository = getRepository(Image);
  const connector = new ImagePgConnector({
    repository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    id: 'test2',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const createdImage = await repository.findOne(image.id);

  t.is(file.compare(createdImage.content), 0);

  await connector.upsert({
    id: 'test2',
    mime: 'something else',
    ext: 'jpg',
    size: 2000,
    content: file,
  });

  const updatedImage = await repository.findOne(image.id);
  t.is(file.compare(updatedImage.content), 0);
  t.is(updatedImage.mime, 'something else');
  t.is(updatedImage.size, 2000);
  t.not(
    createdImage.updatedAt.toISOString(),
    updatedImage.updatedAt.toISOString(),
  );
});

test('update an existing record and change the content', async t => {
  const repository = getRepository(Image);
  const connector = new ImagePgConnector({
    repository,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    id: 'test3',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const createdImage = await repository.findOne(image.id);

  t.is(file.compare(createdImage.content), 0);

  const newFile = fs.readFileSync(`${__dirname}/fixtures/sample2.jpg`);
  await connector.upsert({
    id: 'test3',
    mime: 'something else',
    ext: 'jpg',
    size: 2000,
    content: newFile,
  });

  const updatedImage = await repository.findOne(image.id);
  t.not(file.compare(updatedImage.content), 0);
});
