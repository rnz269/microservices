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
  // only way it's not set is if we didn't use cookieSession mw prior to this route
  if (!req.session?.jwt) {
    return next();
  }

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
