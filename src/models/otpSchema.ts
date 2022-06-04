import mongoose from 'mongoose';

  const otpSchema = new mongoose.Schema(

	{
		visitor_email: { type: String },
		generated_otp: { type: String }
	},
	{
		timestamps: true
	}
);


export default mongoose.model<mongoose.Document>('Otp', otpSchema);


