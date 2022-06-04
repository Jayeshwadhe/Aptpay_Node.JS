import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import disbursement from '../../models/disbursement';
import webhooksService from '../../services/webHooks';
import AuthService from '../../services/auth';

import { Container } from 'typedi';
import { IDisbursementInput } from '../../interfaces/IDisbursement';
import { IDisbursementInstrumentInput } from '../../interfaces/IDisbursementInstrument';
import { Logger } from 'winston';

import logger from '../../loaders/logger';
const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/webhooks', route);

  route.post(
    '/webhookUrl',
    // middlewares.isAuth,
    // middlewares.attachCurrentUser,

    celebrate({
      body: Joi.object({
        url: Joi.string().required(),
      }),
    }),

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      try {
        // var currentUser = req.currentUser;
        // console.log(currentUser);
        const authServiceInstance = Container.get(AuthService);
        const WebhookInstance = Container.get(webhooksService);
        var axiosBody = JSON.stringify({
          url: req.body.url,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        const { userdata1 } = await WebhookInstance.webHooksUrl(axiosBody, hash, req.body);

        return res.status(201).json({
          status: true,

          data: userdata1,
          // token: token,
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
