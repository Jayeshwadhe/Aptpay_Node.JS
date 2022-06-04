import { Document, Model } from 'mongoose';
import { ICountry } from '../../interfaces/ICountry';
import { IUser } from '../../interfaces/IUser';
import { IprepaidInput} from '../../interfaces/Iprepaid';
import { IpartnersInput} from '../../interfaces/Ipartners'
import {INotificationsInput} from '../../interfaces/Inotifications'
import {IcountryDataInputInput} from '../../interfaces/ICountryData'
import {IWalletTransactionInput} from '../../interfaces/IWalletTransaction'

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;

    export type CountryModel = Model<ICountry & Document>;

    export type otpModel = Model<any>;

    export type kycModel = Model<any>;

    export type WaitListModel = Model<any>;
    export type disbursementModel = Model<Document>;
    export type webhooksModels = Model<Document>;

    export type disbursementInstrument = Model<Document>;
    export type merchantModel = Model<Document>;
    export type walletModel = Model<Document>;

    export type prepaidModel= Model<Document>;
    export type crossborderModel= Model<Document>;
    export type partnersModel= Model<Document>;
    export type notificationsModel= Model<Document>;
    export type countryDataModel= Model<Document>;
  }
}