import mongoose from 'mongoose'; // mongoose is a class instance (singleton)
import { app } from './app';

/*****  Starts up Express Application *****/
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
