export class ApplicationError extends Error {}

export class FileNotFoundError extends ApplicationError {
  constructor() {
    super(ErrorMessage.FILE_NOT_FOUND);
  }
}

export enum ErrorMessage {
  FILE_NOT_FOUND = 'File not found',
}
