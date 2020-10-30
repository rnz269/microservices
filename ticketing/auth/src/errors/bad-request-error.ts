import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(public reason: string) {
    super(reason);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
