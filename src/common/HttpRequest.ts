import axios, { AxiosInstance } from 'axios';

import { HttpRequest } from '~types';

const DEFAULT_PARAMS = {
  timeout: 60000,
  headers: {},
};

export class AxiosHttpRequest implements HttpRequest {
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

  async getRemoteAsBuffer(url: string): Promise<Buffer> {
    const res = await this.axios.get(url);

    return Buffer.from(res.data, 'binary');
  }
}
