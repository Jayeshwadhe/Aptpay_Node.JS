import { Router, Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import agendash from 'agendash';
import { Container } from 'typedi';
import config from '../../config';
import middlewares from '../middlewares';
import { celebrate, errors, Joi } from 'celebrate';
import { Logger } from 'winston';
import AuthService from '../../services/auth';
import merchantService from '../../services/merchantService';
import { IMerchantInput } from '../../interfaces/IMerchant';
const axios = require('axios');

const route = Router();

export default (app: Router) => {
  app.use('/merchant', route);

  route.get(
    '/getMerchantDetails',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getMerchantDetails: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        console.log(axiosBody);

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await merchantServiceInstance.getMerchantDetails(hash);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/getMerchantBalance',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getMerchantBalance: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await merchantServiceInstance.getMerchantBalance(hash, axiosBody);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/getTransactionReport',
    // middlewares.isAuth,
    // middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getTransactionReport: %o', req.body);

      // var currentUser = req.currentUser;
      // console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);
        // let date = req.query.date
        // let dateTo = req.query.dateTo

        var axiosBody = '';

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log(hash);
        let userdata1 = await merchantServiceInstance.getTransactionReport(hash, req);

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

  route.get(
    '/getFundingReport',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getFundingReport: %o', req.query);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        // var type = req.query.type

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log(hash);
        let userdata1 = await merchantServiceInstance.getFundingReport(hash, axiosBody);

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

  route.post(
    '/balanceToPayee',
    // celebrate({
    //   body: Joi.object({
    //     payeeId: Joi.number().required(),
    //     // amount: Joi.double().required(),
    //   }),
    // }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('balanceToPayee: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          amount: req.body.amount,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>', hash);

        let userdata1 = await merchantServiceInstance.balanceToPayee(hash, axiosBody);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/getlimits',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getlimits: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        console.log(axiosBody);

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await merchantServiceInstance.getlimits(hash);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/getPrograms',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getMerchantDetails: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        console.log(axiosBody);

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await merchantServiceInstance.getPrograms(hash);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/getPayeeBalance',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getTransactionReport: %o', req.query);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        var payeeId = req.query.payeeId;

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log(hash);
        let userdata1 = await merchantServiceInstance.getPayeeBalance(hash, payeeId);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/:merchantId/list',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getTransactionReport: %o', req.query);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';
        var merchantId = req.query.merchantId;

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log(hash);
        let userdata1 = await merchantServiceInstance.listMerchantGateways(hash, merchantId);

        return res.status(201).json({
          status: true,
          data: userdata1,
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

  route.get(
    '/:program/age-restriction/:country',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getTransactionReport: %o', req.query);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const merchantServiceInstance = Container.get(merchantService);

        var axiosBody = '';

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log(hash);
        let userdata1 = await merchantServiceInstance.getProgramAgeRestriction(hash, req);

        return res.status(201).json({
          status: true,
          data: userdata1,
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
