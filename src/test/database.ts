import test from 'ava';

import { Config } from '~config';
import { Connection, createConnection } from 'typeorm';

export async function setupConnection(): Promise<Connection> {
  const testName = test.meta.file
    .split('/src/')[1]
    .split('/__tests__/')
    .join('_')
    .replace('.spec.ts', '')
    .toLowerCase();

  console.time(`Setting up a new schema [${testName}] for testing`);

  const defaultConnection = await createConnection();
  const hasSchema = await defaultConnection
    .createQueryRunner()
    .hasSchema(testName);
  if (hasSchema) {
    await defaultConnection
      .createQueryRunner()
      .dropSchema(testName, true, true);
  }

  await defaultConnection.createQueryRunner().createSchema(testName);

  const connection = await createConnection({
    ...Config.postgres,
    name: testName,
    type: 'postgres',
    schema: testName,
    logging: ['info', 'error'],
    entities: ['src/entities/*.ts'],
  });

  await connection.synchronize();

  console.timeEnd(`Setting up a new schema [${testName}] for testing`);
  return connection;
}
