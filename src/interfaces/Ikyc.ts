export interface IKycDTO {
    identificationType: string,
    identificationNumber: string,
    identificationDate: Date,
    identificationDateOfExpiration: Date,
    identificationLocation: string,
    virtual: Boolean,
    attestedBy: string,
    kycDone:Boolean;
  }