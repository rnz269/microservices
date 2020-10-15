// import ValidationError type
import { ValidationError } from 'express-validator';

interface CommonErrorStructure {
  errors: { message: string; field?: string }[];
}

export class RequestValidationError extends Error {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super();
    // Only because we are extending a built in class -- TS issue workaround
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeError(): CommonErrorStructure {
    const formattedErrors = this.errors.map((error) => ({
      message: error.msg,
      field: error.param,
    }));
    return { errors: formattedErrors };
  }
}
