import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IprepaidInput } from '../interfaces/Iprepaid';
import partnersModel from '../models/partnersModel';
import config from '../config';
const axios = require('axios');
@Service()

export default class partnersService {
    
    constructor( 
        @Inject('partnersModel') private partnersModel: Models.partnersModel,
    //   @Inject('cards') private cards: Models.cards,
      @Inject('logger') private logger,
    ) {}


   



    
}