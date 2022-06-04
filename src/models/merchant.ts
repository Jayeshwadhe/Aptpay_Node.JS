import mongoose from 'mongoose';
const Merchant = new mongoose.Schema(
  {
    

    payeeId: Number,

    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Merchant', Merchant);