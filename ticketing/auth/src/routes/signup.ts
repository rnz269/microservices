import express, { Request, Response } from 'express';
import { User } from '../models/user';
// body is a mw function that checks req.body & appends error info to req
// validationResult is a func that pulls validation error info off req
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';

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
  async (req: Request, res: Response) => {
    // pull off validation error info to errors object
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // since this is sync code, don't need to manually call next(errors);
      throw new RequestValidationError(errors.array());
    }

    // check if email already exists
    const { email, password } = req.body;
    // if mongoose finds match in db, existingUser will be not null.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email address already in use');
    }
    // hash the password user entered
    // create new user and save them to db
    const user = User.build({ email, password });
    await user.save();
    // send them a cookie since they're now logged in
    res.status(201).send(user);
  }
);

export { router as signupRouter };
