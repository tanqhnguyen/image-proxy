export class ApplicationError extends Error {
  statusCode = 500;
  params = null;
}

export class FileNotFoundError extends ApplicationError {
  constructor() {
    super(ErrorMessage.FILE_NOT_FOUND);
  }
}

export class LinkNotFoundError extends ApplicationError {
  constructor() {
    super(ErrorMessage.LINK_NOT_FOUND);
  }
}

export class NotFoundError extends ApplicationError {
  statusCode = 404;
  constructor() {
    super(ErrorMessage.NOT_FOUND);
  }
}

export enum ErrorMessage {
  FILE_NOT_FOUND = 'File not found',
  LINK_NOT_FOUND = 'Link not found',
  NOT_FOUND = 'Not found',
}
