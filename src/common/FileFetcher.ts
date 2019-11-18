import axios, { AxiosInstance, ResponseType } from 'axios';

import { FileFetcher } from '~types';

const DEFAULT_PARAMS = {
  timeout: 60000,
  headers: {},
};

export class AxiosFileFetcher implements FileFetcher {
  private axios: AxiosInstance;

  constructor(
    params: {
      timeout?: number;
      headers?: object;
    } = {},
  ) {
    const paramsWithDefault = {
      ...DEFAULT_PARAMS,
      ...params,
    };

    this.axios = axios.create({
      timeout: paramsWithDefault.timeout,
      headers: paramsWithDefault.headers,
      responseType: 'arraybuffer',
    });
  }

  async getRemoteAsBuffer(url: string, query?: object): Promise<Buffer> {
    const res = await this.axios.get(url, {
      params: query || {},
    });

    if (res.status > 400) {
      throw new Error(res.statusText);
    }

    return new Buffer(res.data, 'binary');
  }
}
