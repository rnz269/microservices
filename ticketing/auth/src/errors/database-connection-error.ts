import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database';
  statusCode = 500;
  constructor() {
    // providing argument to built-in Error, for server logs
    super('error connecting to db');
    // Only because we are extending a built in class -- TS issue workaround
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
