import { Router, Request, Response } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import cards from '../../models/prepaid';
import partnersService from '../../services/partnersService';
import AuthService from '../../services/auth';

import { Container } from 'typedi';
import { IPartnersInput } from '../../interfaces/Ipartners';
import { Logger } from 'winston';

const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/partners', route);

  route.get(
    '/ListMerchants',
      async (req: Request, res: Response, ) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req);

      
      try {
        const authServiceInstance = Container.get(AuthService);
        var userdata1 = {};
        var axiosBody = "";

         let hash = authServiceInstance.generateBodyHash(axiosBody);
        
        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash':hash },
        };

        await axios
          .get(`${config.APTPAY_Sandbox_API}merchants`, options)
          .then(async Response => {
            // console.log(`Response: ${Response}`);
            // console.log(Response);

            // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
            userdata1 = Response.data;
          })
          .catch(error => {
            console.error(error.response.data)
            throw new Error(error.response.data.errors);
          });

        return res.status(201).json({
          status: true,
          data: userdata1,
          //token: token,
          message: '',
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
          
        });
      }
    },
  );
};
