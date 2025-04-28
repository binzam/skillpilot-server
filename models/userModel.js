import mongoose, { Schema,  } from 'mongoose';

const UserSchema= new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // minlength: 6
    },
    roadmaps: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Roadmap',
      },
    ],
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    resetToken: {
      type: String,
    },
    googleId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);
export default User;
