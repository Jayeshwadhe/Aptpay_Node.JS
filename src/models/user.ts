import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: [true, 'Please enter a full name'],
    //   index: true,
    // },

    first_name: {
      type: String,
      required: [true, 'Please enter a first name'],
      index: true,
    },
    last_name: {
      type: String,
      required: [true, 'Please enter a last name'],
      index: true,
    },

    aptCard_Id: Number,

    walletCreateId:String,



    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    password: String,

    mobile: String,

    countryId: String,

    kycDone:Boolean,
    dateOfBirth:String,
    country:String,
    street: String,
    street_line_2: String,
    city: String,
    zip: String,
    state: String,
    occupation:String,

    salt: String,

    isActive: Boolean,
    isDeleted: Boolean,

    userid:{
      type: String,
      unique: true,
    },

    profilePicture:{
      type: String
    },

    role: {
      type: String,
      default: 'user',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);

