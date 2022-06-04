export interface IDisbursementInput {
    disbursementId: string;
    payeeId: number;
    amount: any;
    transactionType: string;
    disbursementNumber: string;
    currency : string;
    expirationDate : string;
    referenceId: string,
    status: string,
    bankNumber: string,
    branchTransitNumber: string,
    accountNumber: string,
    instrumentId: string,
    program: number,
  }

  export interface IwebhookInput {
    url: string;
  }

