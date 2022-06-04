// import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const companyConstants = new mongoose.Schema(
  {
    aptPayApiKey: {
      type: String,
    },

    LIVE_API_Endpoint: {
      type: String,
    },

    Sandbox_API_Endpoint: {
      type: String,
    },

    


  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('companyConstants', companyConstants);
