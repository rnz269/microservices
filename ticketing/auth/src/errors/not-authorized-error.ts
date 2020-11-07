import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  reason = 'You must be logged in to access this resource';
  statusCode = 401;
  constructor() {
    super('User must log in to access this resource');
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
