// import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const Country = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    country: String, //2 letter country code (ISO 3166 ALPHA-2)

    isActive: Boolean,

    isDelete: Boolean,

    countryCode: String,

    flagUrl: String,
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('Country', Country);
