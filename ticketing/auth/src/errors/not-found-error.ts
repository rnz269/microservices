import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  reason = 'Invalid url request';
  statusCode = 404;
  constructor() {
    // providing argument to built-in Error, for server logs
    super('could not find resource');
    // Only because we are extending a built in class -- TS issue workaround
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
