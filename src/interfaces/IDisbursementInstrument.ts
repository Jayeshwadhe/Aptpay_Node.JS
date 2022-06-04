export interface IDisbursementInstrumentInput {
    instrumentId: string;
    payeeId: number;
    transactionType: string;
    disbursementNumber: string;
    expirationDate : string;
    status: string;
    type:number;
    branchTransitNumber:string;
    bankNumber:string;
  }