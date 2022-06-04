import { Router, Request, Response } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import cards from '../../models/prepaid';
import prepaidService from '../../services/prepaidService';
import AuthService from '../../services/auth';

import { Container } from 'typedi';
import { IprepaidInput } from '../../interfaces/Iprepaid';
import { Logger } from 'winston';

const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/prepaid', route);

  route.post('/activateCard',
    // celebrate({
    //   body: Joi.object({
    //     payeeId:Joi.number().required(),
    //     cardHash:Joi.string().required(),
    //     amount: Joi.number().required()

    //   }),
    // }),
    async (req: Request, res: Response) => {

      try {
        const prepaidServiceInstance = Container.get(prepaidService);
        const authServiceInstance = Container.get(AuthService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);


        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          cardHash: req.body.cardHash,
          amount: req.body.amount,


        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await prepaidServiceInstance.activateCard(hash, axiosBody);

        return res.status(201).json({
          status: true,
          data: userdata1,
          // token: token,
          message: '',
        });
      } catch (e) {

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post(
    '/replace',
    // celebrate({
    //   body: Joi.object({
    //     fromCardHash:Joi.string().required(),
    //     fromCardHash:Joi.string().required(),
    //   }),
    // }),
    async (req: Request, res: Response) => {

      try {
        const prepaidServiceInstance = Container.get(prepaidService);
        const authServiceInstance = Container.get(AuthService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);

        var axiosBody = JSON.stringify({
            fromCardHash: req.body.fromCardHash,
            toCardHash: req.body.toCardHash,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
       
        let userdata1 = await prepaidServiceInstance.prepaidReplace(hash, axiosBody);

        return res.status(201).json({
          status: true,
          data: userdata1,
          // token: token,
          message: '',
        });
      } catch (e) {

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

///////////////-----------------------------------/////////////////////////////////////////////////////////////

  route.post(
    '/reload',
    // celebrate({
    //   body: Joi.object({
    //     cardHash:Joi.string().required(),
    //     amount:Joi.number().required(),
    //   }),
    // }),
    async (req: Request, res: Response) => {

      try {
        const prepaidServiceInstance = Container.get(prepaidService);
        const authServiceInstance = Container.get(AuthService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);

        
        var axiosBody = JSON.stringify({
          cardHash: req.body.cardHash,
          amount: req.body.amount,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        
        let userdata1 = await prepaidServiceInstance.prepaidReload(hash, axiosBody);
         
        return res.status(201).json({
          status: true,
          data: userdata1,
          // token: token,
          message: '',
        });
      } catch (e) {

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );


  route.get(
    '/getCardHash',
   
    // celebrate({
    //   body: Joi.object({
    //     first_name: Joi.string().required(),
    //     last_name: Joi.string().required(),
    //     email: Joi.string().required(),
    //     password: Joi.string().required(),
    //     mobile: Joi.string().required(),
    //     countryId: Joi.string().required(),
    //   }),
    // }),
    async (req: Request, res: Response, ) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      
      try {
        const authServiceInstance = Container.get(AuthService);
        var userdata1 = {};
        var axiosBody = "";

         let hash = authServiceInstance.generateBodyHash(axiosBody);
        
        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash':hash },
        };

        await axios
          .get(`${config.APTPAY_Sandbox_API}prepaid/list`, options)
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
