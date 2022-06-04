// import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const WaitList = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },

    notificationId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('WaitList', WaitList);
