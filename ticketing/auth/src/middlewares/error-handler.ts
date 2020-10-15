import { Request, Response, NextFunction } from 'express';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { RequestValidationError } from '../errors/request-validation-error';

interface CommonErrorStructure {
  errors: { message: string; field?: string }[];
}

/* below, we're simply hoping that RequestValidationError implements the right interface 
   (has serializeError method and has statusCode property)
   we can define an interface, import it to each custom-error subclass, and ensure
   that each custom-error subclass implements it. But this still puts onus on creator
   of subclasses -- we're not doing any checking here below.
   There's a way to do checking below AND consolidate below into one code block
   Instead of RequestValidationError subclass extending built-in Error, 
   create abstract class in between (e.g. Error > CustomError > RequestValidationError). 
   Then, below, would check if err instanceof CustomError. If true, we know for a fact
   err will have serializeError method. Can't do this with interfaces -- 
   if err: ErrorInterface isn't valid. Comes down to err being defined at runtime, after
   typescript has compiled to javascript, and types can't be checked anymore. classes,
   inheritance, instanceof have real place in js, so if err instanceof CustomError works
   
   tl;dr: rather than having an interface which are custom-error classes implement, 
   we'll define an abstract class and have our custom-error classes extend this class.
   */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send(err.serializeError());
  }
  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send(err.serializeError());
  }
  // object below should have consistent structure, as we're sending it back to client
  res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
