import { Services, Streamable } from '~types';

import { Route, Controller } from '../server';
import { SecretKeyStrategy } from '../server/auth/SecretKeyStrategy';

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
  async importFromUrl(params: { url: string }): Promise<{ id: string }> {
    await this.services.remoteFile.importFromUrlIfNotExists(params.url);
    const link = await this.services.remoteFile.generateNewLinkIfNotAvailable(
      params.url,
    );
    return {
      id: link.id,
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
  async serveLink(params: { id: string }): Promise<Streamable> {
    const file = await this.services.remoteFile.getByLinkIdOrThrow(params.id);

    return {
      fileName: `${params.id}.${file.ext}`,
      mime: file.mime,
      content: file.content,
      size: file.size,
      lastModified: file.updatedAt,
    };
  }
}
