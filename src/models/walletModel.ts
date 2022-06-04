import mongoose from 'mongoose';
const wallet = new mongoose.Schema(
  {
      walletCreateId:String,
      WalletTransactions:Array,
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('walletTransaction', wallet);