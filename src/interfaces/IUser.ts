import internal from "stream";

export interface IUser {
  _id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  salt: string;
  mobile: string;
  countryId: string;
  dateOfBirth:string;
  country:string;
  street: string;
  city:string;
  street_line_2: string;
  zip: string;
  state: string;
  aptCard_Id: Number;
  kycDone:Boolean;
  walletCreateId:String;
  isActive: Boolean;
  isDeleted: Boolean;
  userid:string;
  profilePicture:string;
  occupation:string;
  
}

export interface IUserInputDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: string;
  street: string;
  city:string;
  street_line_2: string;
  zip: string;
  state: string;
  countryId: string;
  aptCard_Id: Number;
  walletCreateId:String;
  isActive: Boolean;
  isDeleted: Boolean;
  userid:string;
  profilePicture:string;
  occupation:string;
}

export interface IUserInputDTO2 {
  first_name: string;
  last_name: string;
  email: string;
  userid:string;
}

export interface IUserUpdateDTO {
  dateOfBirth: string;
  country:any;
  street: string;
  street_line_2: string;
  city: string;
  zip: string;
  state: string;
  oldpassword: string;
  NewPassword: string;
  confirmNewPassword:string;
  email:string
  first_name: string;
  last_name: string;
  mobile: string;
  profilePicture: string;
  reportDate:Date;
  activityDate: Date;
  employeeName:string;
  // firstName:string;
  // lastName:string;
  transactionLocation:string;
  transactionDate:string;
  amount:Number;
  currency:string;
  program:Number;
  transactionDescription:string;
  actionTaken:string;
  gender:string;
  businessName:string;
  relationsipToBusiness:string;
  transactionCompleted:string;
  dateAccountOpened:string;
  dateAccountClosed:string;
  statusOfAccount:string;
  clientAccountNumber:string;
  occupation:string;





}


