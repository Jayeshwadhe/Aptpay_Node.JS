import { Router, Request, Response } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import cards from '../../models/prepaid';
import notificationsService from '../../services/notificationsService';
import AuthService from '../../services/auth';

import { Container } from 'typedi';
import { ICrossborderInput } from '../../interfaces/ICrossborder';
import { Logger } from 'winston';

const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/notifications', route);

  route.post('/sendSms',
    // celebrate({
    //   body: Joi.object({
    //     payeeId:Joi.number().required(),
    //     cardHash:Joi.string().required(),
    //     amount: Joi.number().required()
    //   }),
    // }),
    async (req: Request, res: Response) => {

      try {
        const notificationsServiceInstance = Container.get(notificationsService);
        const authServiceInstance = Container.get(AuthService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);


        var axiosBody = JSON.stringify({
            to: req.body.to,
            message: req.body.message,
           
            });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await notificationsServiceInstance.sendSms(hash, axiosBody);

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

  route.post('/sendEmail',
    // celebrate({
    //   body: Joi.object({
    //     payeeId:Joi.number().required(),
    //     cardHash:Joi.string().required(),
    //     amount: Joi.number().required()
    //   }),
    // }),
    async (req: Request, res: Response) => {

      try {
        const notificationsServiceInstance = Container.get(notificationsService);
        const authServiceInstance = Container.get(AuthService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);


        var axiosBody = JSON.stringify({
            to: req.body.to,
            subject: req.body.subject,
            body: req.body.body,
            });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await notificationsServiceInstance.sendEmail(hash, axiosBody);

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
    '/getNotificationServicesStatus',
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
          .get(`${config.APTPAY_Sandbox_API}notification-services/status`, options)
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
