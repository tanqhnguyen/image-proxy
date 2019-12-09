import { Services } from '~types';

import { Route, Controller } from '../server';

@Controller({ prefix: '/images' })
export class ImagesController {
  private services: Services;

  constructor(params: { services: Services }) {
    Object.assign(this, params);
  }

  @Route({
    method: 'post',
    url: '/import',
    input: {
      body: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
    },
    output: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async importFromUrl(params: { url: string }): Promise<{ url: string }> {
    await this.services.remoteFile.importFromUrlIfNotExists(params.url);
    const link = await this.services.remoteFile.generateNewLinkIfNotAvailable(
      params.url,
    );
    return {
      url: link.id,
    };
  }
}
