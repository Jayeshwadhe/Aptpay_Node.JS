import mongoose from 'mongoose';
const Notifications = new mongoose.Schema(
  {
    

    payeeId: Number,

  
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Notifications', Notifications);