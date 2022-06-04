import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IprepaidInput } from '../interfaces/Iprepaid';
import countryDataModel from '../models/countryDataModel';
import { IcountryDataInput } from '../interfaces/ICountryData';
import config from '../config';
import {data} from './data';
const axios = require('axios');

@Service()

export default class countryDataService {
    
    constructor( 
        @Inject('countryDataModel') private countryDataModel: Models.countryDataModel,
    //   @Inject('cards') private cards: Models.cards,
      @Inject('logger') private logger,
    ) {}


    public async countryData(hash, axiosBody): Promise<any> {
        try {
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
              };
        try{
            await this.countryDataModel.collection.drop()
        }catch{
            data.map(async(item)=>{
                const countryData1 = await this.countryDataModel.create(item);
              })
              }
        }
        
         catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

    public async getCountryData(hash, axiosBody): Promise<any> {
        try {
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
              };
         console.log(data);
         const countryData1 = await this.countryDataModel.find()
        
            // const countryData = countryData1.toObject();
            return { countryData1 };
          }
         
         catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

   

  

    
}