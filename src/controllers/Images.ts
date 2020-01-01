import { Services, Streamable } from '~types';

import { Route, Controller } from '../server';
import { SecretKeyStrategy } from '../server/auth/SecretKeyStrategy';
import { File } from '~entities/File';

@Controller({ prefix: '/images' })
export class ImagesController {
  private services: Services;

  constructor(params: { services: Services }) {
    Object.assign(this, params);
  }

  @Route({
    method: 'post',
    auth: [new SecretKeyStrategy()],
    url: '/import',
    requestSchema: {
      body: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
    },
    responseSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  async importFromUrl(params: { url: string }): Promise<{ id: File['id'] }> {
    const file = await this.services.remoteFile.importFromUrlIfNotExists(
      params.url,
    );
    await this.services.remoteFile.generateNewAccessTokenIfNotAvailable(
      params.url,
    );
    return {
      id: file.id,
    };
  }

  @Route({
    method: 'get',
    url: '/:id',
    responseType: 'binary',
    requestSchema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  })
  async serveLink(
    params: { id: string },
    headers: object,
  ): Promise<Streamable> {
    const accessToken = headers['x-file-access-token'];
    const file = await this.services.remoteFile.getByFileIdAndAccessTokenOrThrow(
      params.id,
      accessToken,
    );

    return {
      fileName: `${params.id}.${file.ext}`,
      mime: file.mime,
      content: file.content,
      size: file.size,
      lastModified: file.updatedAt,
    };
  }
}
