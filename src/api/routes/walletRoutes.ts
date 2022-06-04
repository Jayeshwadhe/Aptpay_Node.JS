import { Router, Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import agendash from 'agendash';
import { Container } from 'typedi';
import config from '../../config';
import middlewares from '../middlewares';
import { celebrate, errors, Joi } from 'celebrate';
import { Logger } from 'winston';
import walletService from '../../services/walletService';
import AuthService from '../../services/auth';
import walletTransaction from '../../models/walletModel';
import { IWalletTransactionInput } from '../../interfaces/IWalletTransaction';
const axios = require('axios');

const route = Router();

export default (app: Router) => {
  app.use('/wallet', route);

  route.post(
    '/createWallet',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        payeeId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        var currentUser = req.currentUser;
        console.log(currentUser);
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
        });
        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        const { userdata1 } = await walletServiceInstance.createWallet(currentUser, axiosBody, hash, req.body);

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

  route.post(
    '/addWalletBalance',
    celebrate({
      body: Joi.object({
        payeeId: Joi.number().required(),
        amount: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          amount: req.body.amount,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await walletServiceInstance.addWalletBalance(hash, axiosBody);

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

  route.post(
    '/bulkAddWalletBalance',
    // celebrate({
    //   body: Joi.object([{
    //     payeeId: Joi.number().required(),
    //     amount: Joi.number().required(),
    //   },]),
    // }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = JSON.stringify([
          {
            payees:req.body.payees
          },
          
          {
            payeeId: req.body.payeeId,
            amount: req.body.amount,
          },
          {
            payeeId: req.body.payeeId,
            amount: req.body.amount,
          },
        ]);

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await walletServiceInstance.bulkAddWalletBalance(hash, axiosBody);

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
    '/getWalletBalance',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = '';

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        var walletCreateId = currentUser.walletCreateId;
        let userdata1 = await walletServiceInstance.getWalletBalance(hash, walletCreateId);

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
    '/GetWalletTransactionHistory',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      var currentUser = req.currentUser;

      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = '';
        let walletCreateId = currentUser.walletCreateId;
        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await walletServiceInstance.GetWalletTransactionHistory(hash, walletCreateId);

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
    '/getAllWalletTransactionHistory',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      var currentUser = req.currentUser;

      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        var axiosBody = '';
        // let walletCreateId = currentUser.walletCreateId;
        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await walletServiceInstance.getAllWalletTransactionHistory(hash);

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

  route.post(
    '/sendWalletBalance',
    celebrate({
      body: Joi.object({
        wallet: Joi.string().required(),
        payeeId: Joi.number().required(),
        amount: Joi.number().required(),
        referenceId: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);
        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
        var axiosBody = JSON.stringify({
          wallet: req.body.wallet,
          payeeId: req.body.payeeId,
          amount: req.body.amount,
          referenceId: req.body.referenceId,
        });
        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        let userdata1 = await walletServiceInstance.sendWalletBalance(hash, axiosBody);

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

  route.put(
    '/disableWallet',
    celebrate({
      body: Joi.object({
        payeeId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling wallet/disable endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);
        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
        });
        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        let userdata1 = await walletServiceInstance.disableWallet(hash, axiosBody);

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

  route.put(
    '/enableWallet',
    celebrate({
      body: Joi.object({
        payeeId: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling wallet/enable endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const walletServiceInstance = Container.get(walletService);

        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        let userdata1 = await walletServiceInstance.enableWallet(hash, axiosBody);

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

  route.post('/getWalletIdByEmail', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = JSON.stringify({
        payeeId: req.body.payeeId,
      });
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };
      await axios
        .get(`${config.APTPAY_Sandbox_API}wallet/get-by-email?payeeEmail=${req.body.payeeEmail}`, options)
        .then(async Response => {
          console.log(Response);
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
          userdata1 = error;
          console.error(error.response.data);
           throw new Error(error.response.data.errors);
        });
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
  });
};
