import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload; // optionally defined, depending on whether user is logged in
    }
  }
}

// extract the payload, if it exists, and place it on req.currentUser
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // STEP 1: If req.session.jwt is not set, return early.
  // only way req.session isn't set is if we didn't apply cookieSession mw to express app prior to this route
  // of course, req.session will be empty object if not signed in, or contain jwt if signed in
  if (!req.session?.jwt) {
    return next();
  }

  // Now we know the JWT is set. Let's ensure user hasn't manipulated it:
  // STEP 2: if set and valid, extract info stored inside the JWT (payload) and store on req.currentUser
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    // user is logged in, thus we add a property to our req object
    req.currentUser = payload;
  } catch (err) {}
  next();
};
