import mongoose from 'mongoose';
const Disbursement = new mongoose.Schema(
  {
    disbursementId: String,

    payeeId: Number,

    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

    transactionType: String,

    disbursementNumber: String,

    currency : String,

    expirationDate : String,

    referenceId: String,
    
    status: String,

    bankNumber: String,

    branchTransitNumber: String,

    accountNumber: String,

    instrumentId: String,

    program: Number
    
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Disbursement', Disbursement);