import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IwebhookInput } from '../interfaces/Iwebhook';
import { Container } from 'typedi';
import webhook from '../models/webhooks';
import config from '../config'
import { response } from 'express';
const axios = require('axios');

@Service()

export default class webhooksService {

    constructor(
        // @Inject('WebhooksModels') private webhooksModels: Models.webhooksModels,
     
        @Inject('logger') private logger,
    ) { }

    public async webHooksUrl(axiosBody, hash, body): Promise<any> {
        try {          
          const authServiceInstance = Container.get(webhooksService);    
          var userdata1 = {};    
          const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
          };
          await axios    
            .post(`${config.APTPAY_Sandbox_API}webhook`, axiosBody, options)    
            .then(async Response => {
              console.log(`Response: ${Response}`);    
              console.log(Response.data);    
    
              // const { userdata } = await authServiceInstance.sendpayeeverification(Response.data.id, body.payeeId);    
    
              userdata1 = Response.data;    
              return userdata1;
            }).catch(error => {
              console.error(error.response.data);    
              throw new Error(error.response.data.errors);
            });      
          return { userdata1 };
        } catch (e) {
          this.logger.error(e);
          throw e;
        }
      }
}