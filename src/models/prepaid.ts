import mongoose from 'mongoose';
const prepaid = new mongoose.Schema(
  {
    payeeId: Number,
    cardHash:String,
    amount:Number,
    fromCardHash:String,
    toCardHash:String,

    merchantBalance: {
        type: mongoose.Schema.Types.Decimal128
        },
   
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('prepaid', prepaid);