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
  }
}

export namespace Service {
  export interface Proxy {
    importFromUrlIfNotExists(url: string): Promise<FileEntity | null>;
    generateNewLinkIfNotAvailable(url: string): Promise<LinkEntity>;
  }
}

export type Services = {
  remoteFile: Service.Proxy;
};

export type Connectors = {
  file: Connector.File;
  link: Connector.Link;
};

export interface FileFetcher {
  getRemoteAsBuffer(url: string): Promise<Buffer>;
}
