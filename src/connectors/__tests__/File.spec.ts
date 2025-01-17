import test from 'ava';

import { Repository } from 'typeorm';
import { File } from '~entities/File';
import { FileConnector } from '~connectors/File';
import * as fs from 'fs';
import { setupConnection } from '~test/database';
import { AxiosHttpRequest } from '~common/HttpRequest';

let imageRepository: Repository<File>;

const fileFetcher = new AxiosHttpRequest();

test.before(async () => {
  const connection = await setupConnection();
  imageRepository = connection.getRepository(File);
});

test('insert a new record', async t => {
  const connector = new FileConnector({
    repository: imageRepository,
    httpRequest: fileFetcher,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    url: 'test1',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const savedImage = await imageRepository.findOne(image.id);

  t.is(file.compare(savedImage.content), 0);
});

test('update an existing record but keep the content', async t => {
  const connector = new FileConnector({
    repository: imageRepository,
    httpRequest: fileFetcher,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    url: 'test2',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const createdImage = await imageRepository.findOne(image.id);

  t.is(file.compare(createdImage.content), 0);

  await connector.upsert({
    url: 'test2',
    mime: 'something else',
    ext: 'jpg',
    size: 2000,
    content: file,
  });

  const updatedImage = await imageRepository.findOne(image.id);
  t.is(file.compare(updatedImage.content), 0);
  t.is(updatedImage.mime, 'something else');
  t.is(updatedImage.size, 2000);
  t.not(
    createdImage.updatedAt.toISOString(),
    updatedImage.updatedAt.toISOString(),
  );
});

test('update an existing record and change the content', async t => {
  const connector = new FileConnector({
    repository: imageRepository,
    httpRequest: fileFetcher,
  });

  const file = fs.readFileSync(`${__dirname}/fixtures/sample1.jpg`);

  const image = await connector.upsert({
    url: 'test3',
    mime: 'something',
    ext: 'jpg',
    size: 1000,
    content: file,
  });

  const createdImage = await imageRepository.findOne(image.id);

  t.is(file.compare(createdImage.content), 0);

  const newFile = fs.readFileSync(`${__dirname}/fixtures/sample2.jpg`);
  await connector.upsert({
    url: 'test3',
    mime: 'something else',
    ext: 'jpg',
    size: 2000,
    content: newFile,
  });

  const updatedImage = await imageRepository.findOne(image.id);
  t.not(file.compare(updatedImage.content), 0);
});
