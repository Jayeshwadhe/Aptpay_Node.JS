import mongoose from 'mongoose';
const disbursementInstrument = new mongoose.Schema(
  {
    instrumentId: String,

    payeeId: Number,

    disbursementNumber: String,

    expirationDate: String,

    branchTransitNumber:String,

    type : Number,

    bankNumber: String,
    
    status: String,
    isDeleted :{
        type: Boolean,
        default:false
    }
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('disbursementInstrument', disbursementInstrument);