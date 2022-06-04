import { Service, Inject } from 'typedi';
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: 'aptpaydemo@gmail.com',			//email ID
       pass: 'aptpaydemo@@1A'				//Password 
     }
 });

@Service() 
export default class gMailerService {
  constructor(
    @Inject('emailClient') private emailClient
  ) { }
  

  public async sendgMail(email , otp){
    var details = {
      from: 'aptpaydemo@gmail.com', // sender address same as above
      to: email, 					// Receiver's email id
      subject: 'Your demo OTP is :' + otp, // Subject of the mail.
      //html: otp					// Sending OTP 
    };
  
  
    transporter.sendMail(details, function (error, data) {
      if(error)
        console.log(error)
      else
        console.log(data);
      });
    }
 
}
