import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // STEP 0: process any errors appended by validator middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // since this is sync code, don't need to manually call next(errors);
    throw new RequestValidationError(errors.array());
  }
  next();
};
