import mongoose from 'mongoose';
const partners = new mongoose.Schema(
  {
    

    payeeId: Number,

    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

    transactionType: String,

   

    currency : String,

    expirationDate : String
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Partner', partners);