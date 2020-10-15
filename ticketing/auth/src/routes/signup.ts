import express, { Request, Response } from 'express';
// body is a middleware function that checks req.body & appends error info to req
// validationResult is a function that pulls off validation error info of req
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'), // produces err msg if isEmail returns false
    body('password')
      .trim() // sanitization step
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  (req: Request, res: Response) => {
    // pull off validation error info to errors object
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // since this is sync code, don't need to manually call next(errors);
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    console.log('Creating a user...');
    throw new DatabaseConnectionError();

    res.send({});
  }
);

export { router as signupRouter };
