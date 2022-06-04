import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IDisbursementInput } from '../interfaces/IDisbursement';
import { Container } from 'typedi'

import Disbursement from '../models/disbursement';
import MailerService from './mailer';
import gMailerService from './gMailer';
import AuthService from '../services/auth';
import config from '../config'


const axios = require('axios');

@Service()

export default class walletService {
  constructor(
    @Inject('walletModel') private walletModel: Models.walletModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }


  public async createWallet(currentUser, axiosBody, hash, body): Promise<any> {
    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      await axios
        .post(`${config.APTPAY_Sandbox_API}wallet/create`, axiosBody, options)
        .then(async Response => {
          console.log(`Response: ${Response}`);
          console.log(Response.data.id);

          const { kycData } = await authServiceInstance.isKycDone(currentUser.aptCard_Id);
          const { userdata } = await authServiceInstance.updateWalletCreateId(Response.data.id, body.payeeId);

          userdata1 = userdata;
          return userdata1
        })
        .catch(error => {
          console.error(error.response.data)
          throw new Error(error.response.data.errors);
        });

      return { userdata1 };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async addWalletBalance(hash, axiosBody): Promise<any> {
    try {
      var userdata1 = {};
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      let mainres = await axios
        .post(`${config.APTPAY_Sandbox_API}wallet/add`, axiosBody, options)
        .then(async Response => {

          //  const { userdata } = await authServiceInstance.updateWalletFundAdd(Response.data.id, req.body.payeeId);
          userdata1 = Response.data;
          return userdata1
        })
        .catch(error => {
          console.error(error.response.data)
          throw error.response.data;
        });

      return { mainres };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async bulkAddWalletBalance(hash, axiosBody): Promise<any> {
    try {
      var userdata1 = {};
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      let mainres = await axios
        .post(`${config.APTPAY_Sandbox_API}wallet/bulk-add`, axiosBody, options)
        .then(async Response => {

          //  const { userdata } = await authServiceInstance.updateWalletFundAdd(Response.data.id, req.body.payeeId);
          userdata1 = Response.data;
          return userdata1
        })
        .catch(error => {
          console.error(error.response.data)
          throw error.response.data;
        });

      return { mainres };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getWalletBalance(hash, walletCreateId) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}wallet/balance/${walletCreateId}`, options)
      .then(async Response => {
        // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
        userdata1 = Response.data;
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async sendWalletBalance(hash, axiosBody) {

    let userdata1 = {};

    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };
    let mainres = await axios
      .post(`${config.APTPAY_Sandbox_API}wallet/withdraw`, axiosBody, options)
      .then(async Response => {

        //  const { userdata } = await authServiceInstance.updateWalletFundAdd(Response.data.id, req.body.payeeId);
        userdata1 = Response.data;
        return userdata1
      })
      .catch(error => {
        console.error(error.response.data)
        throw error.response.data;
      });
    return mainres;
  }

  public async GetWalletTransactionHistory(hash, walletCreateId) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };

    let mainser = await axios
      .get(`${config.APTPAY_Sandbox_API}wallet/history/${walletCreateId}`, options)
      .then(async Response => {
        // console.log(`Response: ${Response}`);
        console.log(Response.data);

        // const { userdata } = await authServiceInstance.updateWalletCreateId(Response.data.id, req.body.payeeId);
        const transactionWALLET = await this.walletModel.create({
          walletCreateId:walletCreateId,
          WalletTransactions:Response.data

        });
        const wallet = transactionWALLET.toObject();
      
        userdata1 = wallet;
        return userdata1
      })
      .catch(error => {
        // console.error(error.response.data)
        throw error.response.data.errors;
      });
    return mainser

  }

  public async getAllWalletTransactionHistory(hash) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };

    let mainser = await axios
      .get(`${config.APTPAY_Sandbox_API}wallet/history`, options)
      .then(async Response => {
        // console.log(`Response: ${Response}`);
        console.log(Response.data);

        // const { userdata } = await authServiceInstance.updateWalletCreateId(Response.data.id, req.body.payeeId);
        const transactionWALLET = await this.walletModel.create({
          // walletCreateId:walletCreateId,
          WalletTransactions:Response.data

        });
        const wallet = transactionWALLET.toObject();
      
        userdata1 = wallet;
        return userdata1
      })
      .catch(error => {
        // console.error(error.response.data)
        throw error.response.data.errors;
      });
    return mainser

  }

  public async disableWallet(hash, axiosBody) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };
    let mainres = await axios
      .put(`${config.APTPAY_Sandbox_API}wallet/disable`, axiosBody, options)
      .then(async Response => {
        console.log(`Response: ${Response}`);
        console.log(Response.data.id);

        // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
        userdata1 = Response.data;
        return userdata1;
      })
      .catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async enableWallet(hash, axiosBody) {
    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };
    let mainres = await axios
      .post(`${config.APTPAY_Sandbox_API}wallet/enable`, axiosBody, options)
      .then(async Response => {
        // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
        userdata1 = Response.data;
        return userdata1;

      })
      .catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async getWalletIdByEmail(hash, axiosBody, req) {

    let userdata1 = {};

    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
    };
    await axios
      .get(`${config.APTPAY_Sandbox_API}wallet/get-by-email`, axiosBody, options)
      .then(async Response => {

        //  const { userdata } = await authServiceInstance.updateWalletFundAdd(Response.data.id, req.body.payeeId);
        userdata1 = Response.data;
        return userdata1
      })
      .catch(error => {
        // console.error(error.response.data)
        throw error.response.data;
      });
    
  }

  
}


