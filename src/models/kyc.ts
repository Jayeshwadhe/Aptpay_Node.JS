import mongoose from 'mongoose';

const kyc = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    identificationType: {
      type: String,
      required: true,
    },

    identificationNumber: {
      type: String,
      required: true,
    },

    identificationDate: {
      type: Date,
      required: true,
    },

    identificationDateOfExpiration: {
      type: Date,
      required: true,
    },

    identificationLocation: {
      type: String,
      required: true,
    },

    virtual: {
      type: Boolean,
      required: true,
      default: true,
    },

    attestedBy: String,
    kycDone:Boolean,
  },
  { timestamps: true },
);

export default mongoose.model<mongoose.Document>('kyc', kyc);
