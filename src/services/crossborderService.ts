import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IprepaidInput } from '../interfaces/Iprepaid';
import prepaidModel from '../models/prepaid';
import config from '../config';
import { rest } from 'lodash';
const axios = require('axios');
@Service()

export default class crossborderService {

  constructor(
    @Inject('crossborderModel') private crossborderModel: Models.crossborderModel,
    @Inject('countryDataModel') private countryDataModel: Models.countryDataModel,

    //   @Inject('cards') private cards: Models.cards,
    @Inject('logger') private logger,
  ) { }


  public async createTransaction(hash, axiosBody,payeeId): Promise<any> {
    try {

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      console.log("////////////////////////////",axiosBody);
      let mainres = await axios.post(`${config.APTPAY_Sandbox_API}crossborder/transaction/create`, axiosBody, options)
        .then(async Response => {
          console.log(`Response: ${Response}`);
          // console.log(Response.data.id);
          const crossborder = await this.crossborderModel.create({
            recieverPayeeId:payeeId ,
            transaction_id:Response.data.id
          });
          const prepaid = crossborder.toObject();
          return { prepaid };
        })
        .catch(async error => {
         
          console.error(error.response.data)
          throw error.response.data;

        });
      return mainres
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getCountryData(hash, axiosBody): Promise<any> {
    try {
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      console.log(axiosBody);
      let mainres = await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/country-services`, options)
        .then(async Response => {
          let respons = Response.data;
          let rightFormat = [];
          Object.keys(respons).map((prop, index) => {
             Object.keys(respons[prop]).map(pr =>
              rightFormat.push({ ...respons[prop][pr], code: pr }),
            );
          });
          var cross = await this.countryDataModel.find()
          if(!cross){
            throw new Error("Data Not Found")
          }
          var finalDataPromise = [];
          rightFormat.map(item => {
            finalDataPromise.push(this.countryDataModel.findOne({ code: item.code }))          
          })

          var finalData = [];
          const resolvedPromise = await Promise.all(finalDataPromise);
          resolvedPromise.forEach((country, index) => {
            const h = country.toObject()
            const { name,flag,code,dial_code,currency,isoAlpha2,isoAlpha3,isoNumeric}=h
            finalData.push({ name,flag,code,dial_code,currency,isoAlpha2,isoAlpha3,isoNumeric, ...rightFormat[index] });
          })

          return finalData;
        })
        .catch(async error => {
          console.error(error.response.data)
          throw error.response.data;

        });
      return mainres
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

  }






}