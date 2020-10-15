interface CommonErrorStructure {
  errors: { message: string; field?: string }[];
}

export class DatabaseConnectionError extends Error {
  reason = 'Error connecting to database';
  statusCode = 500;
  constructor() {
    super();
    // Only because we are extending a built in class -- TS issue workaround
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeError(): CommonErrorStructure {
    return { errors: [{ message: this.reason }] };
  }
}
