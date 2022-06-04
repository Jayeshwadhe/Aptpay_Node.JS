import mongoose from 'mongoose';
const Crossborder = new mongoose.Schema(
  {
    

    recieverPayeeId: Number,

    transaction_id:String
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Crossborder', Crossborder);