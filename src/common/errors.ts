export class ApplicationError extends Error {
  statusCode = 500;
  params = null;
}

export class FileNotFoundError extends ApplicationError {
  statusCode = 404;
  constructor() {
    super(ErrorMessage.FILE_NOT_FOUND);
  }
}

export class AccessTokenNotFoundError extends ApplicationError {
  constructor() {
    super(ErrorMessage.ACCESS_TOKEN_NOT_FOUND);
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
  ACCESS_TOKEN_NOT_FOUND = 'Link not found',
  NOT_FOUND = 'Not found',
}
