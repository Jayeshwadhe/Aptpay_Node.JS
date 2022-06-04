import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IprepaidInput } from '../interfaces/Iprepaid';
import prepaidModel from '../models/prepaid';
import config from '../config';
const axios = require('axios');
@Service()

export default class notificationsService {
    
    constructor( 
        @Inject('notificationsModel') private notificationsModel: Models.notificationsModel,
    //   @Inject('cards') private cards: Models.cards,
      @Inject('logger') private logger,
    ) {}


    public async sendSms(hash,axiosBody): Promise<any> {
        try {
           
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
              };
         console.log(axiosBody);
        let mainres= await axios.post(`${config.APTPAY_Sandbox_API}sms/send`, axiosBody, options)
          .then(async Response => {
            console.log(`Response: ${Response}`);
            console.log(Response.data.id);
            
            const notificationsSendSms = await this.notificationsModel.create({
              payeeId:1234,
            });
            const notifications = notificationsSendSms.toObject();
            return { notifications };
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

    public async sendEmail(hash,axiosBody): Promise<any> {
        try {
           
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
              };
         console.log(axiosBody);
        let mainres= await axios.post(`${config.APTPAY_Sandbox_API}email/send`, axiosBody, options)
          .then(async Response => {
            console.log(`Response: ${Response}`);
            console.log(Response.data.id);
            
            const notificationsSendSms = await this.notificationsModel.create({
              payeeId:1234,
            });
            const notifications = notificationsSendSms.toObject();
            return { notifications };
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