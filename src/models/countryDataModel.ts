import mongoose from 'mongoose';
const countryData = new mongoose.Schema(
  {
    name: String,
    flag: String,
    code: String,
    dial_code: String,
    currency:Object,
    isoAlpha2:String,
    isoAlpha3:String,
    isoNumeric:Number,


  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('CountryData', countryData);