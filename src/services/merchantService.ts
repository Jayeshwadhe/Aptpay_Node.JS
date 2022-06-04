import { Service, Inject } from 'typedi';
import Disbursement from '../models/disbursement';
import MailerService from './mailer';
import gMailerService from './gMailer';
import AuthService from '../services/auth';
import config from '../config'
import { format } from 'path';
import { IMerchantInput } from '../interfaces/IMerchant';
import merchant from '../models/merchant';


const axios = require('axios');

@Service()

export default class merchantService {
  constructor(
    // @Inject('merchantModel') private merchantModel: Models.merchantModel,
    @Inject('disbursementInstrument') private disbursementInstrument: Models.disbursementInstrument,
    @Inject('logger') private logger,
  ) {}

  public async getMerchantDetails(hash) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}merchant/detail`, options)
      .then(async Response => {
        userdata1 = Response.data;
        console.log(userdata1);
        
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async getMerchantBalance(hash,axiosBody) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}balance`, options)
      .then(async Response => {
        userdata1 = Response.data;
        return userdata1
      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }  

  public async getTransactionReport(hash,req) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}reports/merchant-transactions-report/${req.params.date}[/${req.params.dateTo}]?format=${req.body.json}`, options)
      .then(async Response => {
        // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
        userdata1 = Response.data;
        console.log(userdata1);
        
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        // throw new Error(error.response.data.errors);
        throw (error.response.data.errors);
      });
    return mainres;
  }  

  public async getFundingReport(hash,axiosBody) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}reports/merchant-funding-report/:date[/:dateTo]?format=json`, options)
      .then(async Response => {
        userdata1 = Response.data;
        console.log(userdata1);
        
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }  
  public async balanceToPayee(hash: string, axiosBody: string): Promise<any> {
    try {
      var userdata1 = {};
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      let mainres = await axios.post(`${config.APTPAY_Sandbox_API}balance/push`, axiosBody, options)
        .then(async Response => {
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
  public async getPayeeBalance(hash,payeeId) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}payee/balance/${payeeId}`, options)
      .then(async Response => {
        userdata1 = Response.data;
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }
  public async getlimits(hash) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}limits`, options)
      .then(async Response => {        
        userdata1 = Response.data;
        console.log(userdata1);
        
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async getPrograms(hash) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}programs`, options)
      .then(async Response => {
        userdata1 = Response.data;
        console.log(userdata1);
        
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async listMerchantGateways(hash,merchantId) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}merchant-gateway/${merchantId}/list`, options)
      .then(async Response => {
        userdata1 = Response.data;
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

  public async getProgramAgeRestriction(hash,req) {

    let userdata1 = {};
    const options = {
      headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json','body-hash': hash },
    };

    let mainres = await axios
      .get(`${config.APTPAY_Sandbox_API}program/${req.params.program}/age-restriction/${req.params.country}`, options)
      .then(async Response => {

        userdata1 = Response.data;
        return userdata1

      }).catch(error => {
        console.error(error.response.data)
        throw new Error(error.response.data.errors);
      });
    return mainres;
  }

}