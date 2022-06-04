export interface ICompany {
  _id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  salt: string;
  mobile: string;
  countryId: string;
  street: string;
  street_line_2: string;
  city: string;
  zip: string;
  state: string;
  aptCard_Id: Number;
  isActive: Boolean;
  isDeleted: Boolean;
}
