import express from 'express'; // module factory function
import 'express-async-errors';
import { json } from 'body-parser'; // json module factory function
import mongoose from 'mongoose'; // mongoose is a class instance (singleton)
import cookieSession from 'cookie-session'; // module factory function

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
// express sees traffic is being proxied to our app through ingress-nginx, defaults to distrusting https connection
// trust traffic as secured even though it's coming from the proxy
app.set('trust proxy', true);
// json() returns middleware jsonParser()
app.use(json());
app.use(
  cookieSession({
    signed: false, // disable encryption on cookie, since jwt is encrypted
    secure: true, // cookies only used if user visiting our app over https connection
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// 'express-async-errors' library allows express to auto-handle async errors (rather than require manual next(e) call)
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('Requested environment variable does not exist');
  }
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start();
