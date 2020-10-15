export abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor(log: string) {
    // providing argument to built-in Error, for server logs
    super(log);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  abstract serializeErrors(): { message: string; field?: string }[];
}
