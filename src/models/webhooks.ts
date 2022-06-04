import mongoose from 'mongoose';
const webhook = new mongoose.Schema(
  {
    

    url: String,
    // payeeID: String


  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('webhook', webhook);