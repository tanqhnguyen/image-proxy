import { File as FileEntity } from '~entities/File';
import { Link as LinkEntity } from '~entities/Link';

export type WithoutMetaColumn<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export namespace Connector {
  export type FileUpsertParams = Omit<WithoutMetaColumn<FileEntity>, 'links'>;
  export interface File {
    upsert(file: FileUpsertParams): Promise<FileEntity>;
    getByUrl(url: string): Promise<FileEntity | null>;
    getRemote(
      url: string,
    ): Promise<{
      content: Buffer;
      name: string;
      ext: string;
      mime: string;
    }>;
  }

  export interface Link {
    generate(fileId: FileEntity['id'], ttl?: number): Promise<LinkEntity>;
    getValidByFileId(fileId: FileEntity['id']): Promise<LinkEntity[]>;
    getByIdWithFile(id: LinkEntity['id']): Promise<LinkEntity | null>;
  }
}

export namespace Service {
  export interface Proxy {
    importFromUrlIfNotExists(url: string): Promise<FileEntity | null>;
    generateNewLinkIfNotAvailable(url: string): Promise<LinkEntity>;
    getByLinkIdOrThrow(id: LinkEntity['id']): Promise<FileEntity>;
  }
}

export type Services = {
  remoteFile: Service.Proxy;
};

export type Connectors = {
  file: Connector.File;
  link: Connector.Link;
};

export interface HttpRequest {
  getRemoteAsBuffer(url: string): Promise<Buffer>;
}

export type RouteConfig = {
  method: 'get' | 'post' | 'delete' | 'patch' | 'head' | 'option';
  auth?: WebServer.AuthStrategy[];
  responseType?: 'json' | 'binary';
  url: string;
  requestSchema?: Partial<{
    params: object;
    querystring: object;
    body: object;
  }>;
  responseSchema?: object;
};

export type ControllerConfig = {
  prefix: string;
};

export type ClassDecorator = (constructor: any) => any;

export type MethodDecorator = (
  target,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor;

export namespace WebServer {
  export interface Server {
    addController(controller: any, options?: Partial<{ prefix: string }>): void;
    listen(port: number, host?: string): void;
  }

  export interface AuthStrategy {
    verify(requestParams: object, headers: object): Promise<boolean>;
  }
}

export interface Streamable {
  fileName: string;
  mime: string;
  size: number;
  content: Buffer;
  lastModified: Date;
}

export interface Logger {
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}
