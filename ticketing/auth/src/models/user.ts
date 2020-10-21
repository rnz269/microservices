// issue 1: When we create a new User Document via constructor, TS can't check arguments
// issue 2: properties we pass to User constructor may not match those available on user
import mongoose from 'mongoose';

// an interface that describes the properties that are required to create a new user: issue 1
interface UserAttrs {
  email: string;
  password: string;
}

// an interface that describes the properties that a User Model has: solves issue 1
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties that a User Document has: solves issue 2
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  // if we had extra properties that mongoose added, we'd list them here
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// to create new user, call User.build(..) instead of default constructor new User(..)
// allows TS to check the argument, as mongoose prevents TS from doing so
// Must add build method to User model's interface for TS to recognize it
userSchema.statics.build = function (attrs: UserAttrs) {
  return new User(attrs);
};

// mongoose creates a model out of schema. Model is how we access data from MongoDB.
// User: UserModel
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
