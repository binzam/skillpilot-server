import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    receiverUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
