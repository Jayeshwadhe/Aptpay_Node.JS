import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IprepaidInput } from '../interfaces/Iprepaid';
import prepaidModel from '../models/prepaid';
import config from '../config';

const axios = require('axios');
@Service()

export default class prepaidService {
    
    constructor( 
        @Inject('prepaidModel') private prepaidModel: Models.prepaidModel,
    //   @Inject('cards') private cards: Models.cards,
      @Inject('logger') private logger,
    ) {}


    public async activateCard(hash,axiosBody): Promise<any> {
        try {
           
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
              };
         console.log(axiosBody);
        let mainres= await axios.post(`${config.APTPAY_Sandbox_API}prepaid/activate`, axiosBody, options)
          .then(async Response => {
            console.log(`Response: ${Response}`);
            console.log(Response.data.id);
            
            const prepaidActivate = await this.prepaidModel.create({
              payeeId:axiosBody.payeeId,
              merchantBalance:1234

            });
            const prepaid = prepaidActivate.toObject();
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

    public async prepaidReplace(hash,axiosBody): Promise<any> {
        try {
          var userdata1 = {};
          const options = {
              headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
            };
       console.log(axiosBody);

          let mainres= await axios.post(`${config.APTPAY_Sandbox_API}prepaid/replace`, axiosBody, options)
          .then(async Response => {
            console.log(`Response: ${Response}`);
            // console.log(Response.data.id);

            userdata1 = Response;
            return userdata1
          })
          .catch(error => {
            console.error(error.response.data)
            throw error.response.data;
          });
          return mainres
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

    public async prepaidReload(hash,axiosBody): Promise<any> {
      try {
        var userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
          };
     console.log(axiosBody);

        let mainres= await axios.post(`${config.APTPAY_Sandbox_API}prepaid/reload`, axiosBody, options)
        .then(async Response => {
          console.log(`Response: ${Response}`);
          // console.log(Response.data.id);

          userdata1 = Response;
          return userdata1
        })
        .catch(error => {
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