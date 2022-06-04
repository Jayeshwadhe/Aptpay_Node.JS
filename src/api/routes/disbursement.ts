import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import disbursement from '../../models/disbursement';
import DisbursementService from '../../services/disbursement';
import AuthService from '../../services/auth';


import { Container } from 'typedi';
import { IDisbursementInput } from '../../interfaces/IDisbursement';
import {IDisbursementInstrumentInput} from '../../interfaces/IDisbursementInstrument'
import { Logger } from 'winston';

import logger from '../../loaders/logger';
const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/disbursement', route);

  route.post('/addDisbursement',
    // middlewares.isAuth,
    // celebrate({
    //     body: Joi.object({
    //         amount: Joi.number().required(),
    //         transactionType: Joi.string().required(),
    //         payeeId: Joi.number().required(),
    //         currency : Joi.string().required(),
    //         disbursementNumber : Joi.string(),
    //         expirationDate : Joi.string(),
    //         referenceId: Joi.string().required(),
    //         network : Joi.string()

    //   }),
    // }),

    async (req, res) => {
      try {
        const disbursementInstance = Container.get(DisbursementService);
        var disbursementDetails = {};
        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          amount: req.body.amount,
          transactionType: req.body.transactionType,
          disbursementNumber: req.body.disbursementNumber,
          currency: req.body.currency,
          expirationDate: req.body.expirationDate,
        });
        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json' },
        };
        return await axios
          .post(`${config.APTPAY_Sandbox_API}disbursements/add`, req.body, options)
          .then(async Response => {
            console.log(`Response: ${Response}`);
            console.log(`ID: ${Response.data.id}`);
            req.body.disbursementId = Response.data.id;
            var disbursementData = await disbursementInstance.CreateDisbursement(req.body as IDisbursementInput);
            disbursementDetails = disbursementData;
            return res.status(201).json({
              status: true,
              data: disbursementDetails,
              message: '',
            });
          })
          .catch(error => {
            console.error(error);
            return res.status(400).send({
              success: false,
              message: "Request is Invalid",
              error: error,
            });
          });

        // return res.status(201).json({
        //   status: true,
        //   data: disbursementDetails,
        //   message: '',
        // });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return res.status(200).send({
          success: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post('/addDisbursementV1',
    
      celebrate({
        body: Joi.object({
            amount: Joi.number().required(),
            transactionType: Joi.string().required(),
            payeeId: Joi.number().required(),
            currency : Joi.string().required(),
            referenceId: Joi.string().required(),
            disbursementNumber : Joi.string(),
            expirationDate : Joi.string(),            
            bankNumber:Joi.string().min(3),
            branchTransitNumber:Joi.string().min(5),
            accountNumber:Joi.string().max(12),
            instrumentId:Joi.string(),
            program: Joi.number()
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const disbursementInstance = Container.get(DisbursementService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          amount: req.body.amount,
          transactionType: req.body.transactionType,
          disbursementNumber: req.body.disbursementNumber,
          currency: req.body.currency,
          expirationDate: req.body.expirationDate,
          referenceId: req.body.referenceId,
          bankNumber: req.body.bankNumber,
          branchTransitNumber: req.body.branchTransitNumber,
          accountNumber: req.body.accountNumber,
          instrumentId: req.body.instrumentId,
          program: req.body.program,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        let userdata1 = await disbursementInstance.addDisbursementV1(hash, axiosBody, req.body as IDisbursementInput );

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

  route.get(
    '/disbursements/:disbursement_id',
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
          .get(`${config.APTPAY_Sandbox_API}disbursements/${req.params.disbursement_id}`, options)
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

  route.post('/checkAccount',
    celebrate({
      body: Joi.object({
          amount: Joi.number().required(),
          disbursementNumber : Joi.string(),
          currency: Joi.string().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const disbursementInstance = Container.get(DisbursementService);

      var axiosBody = JSON.stringify({
        amount: req.body.amount,
        currency: req.body.currency	,
        program: req.body.program	,
        disbursementNumber: req.body.disbursementNumber	,
        instrumentId: req.body.instrumentId,
        expirationDate: req.body.expirationDate,
      });

      let hash = await authServiceInstance.generateBodyHash(axiosBody);
      let userdata1 = await disbursementInstance.checkAccount(hash, axiosBody);

      return res.status(201).json({
        status: true,
        data: userdata1,
        message: 'Success',
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

  route.post('/addDisbursementInstrument',
    celebrate({
      body: Joi.object({
          payeeId	: Joi.number().required(),
          disbursementNumber : Joi.string(),
          branchTransitNumber:Joi.string(),
          bankNumber:Joi.string(),
          currency : Joi.string(),
          expirationDate : Joi.string(),
          type:Joi.number()
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body as IDisbursementInstrumentInput);
    try {
      const authServiceInstance = Container.get(AuthService);
      const disbursementInstance = Container.get(DisbursementService);

      var axiosBody = JSON.stringify({
        payeeId: req.body.payeeId,
        disbursementNumber: req.body.disbursementNumber,
        expirationDate: req.body.expirationDate,
        bankNumber: req.body.bankNumber,
        branchTransitNumber: req.body.branchTransitNumber,
        type: req.body.type,       
      });      

      let hash = await authServiceInstance.generateBodyHash(axiosBody);
      let userdata1 = await disbursementInstance.addDisbursementInstrument(hash,axiosBody,req.body as IDisbursementInstrumentInput);

      return res.status(201).json({
        status: true,
        data: userdata1,
        // token: token,
        message: '',
      });
    } catch (e) {
      logger.error('🔥 error: %o,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,', e);
      return res.status(200).send({
        status: false,
        message: e,
        error: e.message,
      });
      // return res.status(200).send({status: false,Message: "Payment instrument already exists" })
    }
  },
  );

  route.get(
    '/disbursement-instrument/:instrumentId',
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
          .get(`${config.APTPAY_Sandbox_API}disbursement-instrument/${req.params.instrumentId}`, options)
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

  route.get(
    '/disbursement-instrument/list/:payeeId',
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
          .get(`${config.APTPAY_Sandbox_API}disbursement-instrument/list/${req.params.payeeId}`, options)
          .then(async Response => {
            // console.log(`Response: ${Response}`);
            // console.log(Response);

            // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
            userdata1 = Object.values(Response.data);
            
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
  
  route.post('/deleteInstrument',
 
    celebrate({
      query: Joi.object({
          instrumentId: Joi.string().required()
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.query);

    var currentUser = req.currentUser;
    console.log(currentUser);
    try {
      const authServiceInstance = Container.get(AuthService);
      const disbursementInstance = Container.get(DisbursementService);

      var axiosBody =""

      let hash = await authServiceInstance.generateBodyHash(axiosBody);
      let instrumentId = req.query.instrumentId
      let userdata1 = await disbursementInstance.deleteInstrument(hash, instrumentId);

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

  route.get('/kycCheck',
  middlewares.isAuth,
  middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
          amount: Joi.number().required(),
          gateway: Joi.string().required(),
          payeeId: Joi.string().required(),
          program : Joi.string().required()
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    var currentUser = req.currentUser;
    console.log(currentUser);
    try {
      const authServiceInstance = Container.get(AuthService);
      const disbursementInstance = Container.get(DisbursementService);

      var axiosBody = JSON.stringify({
        amount: req.body.amount,
        gateway: req.body.gateway,
        payeeId: req.body.payeeId,
        program: req.body.program,
      });

      let hash = await authServiceInstance.generateBodyHash(axiosBody);
console.log('sss',hash);

      let userdata1 = await disbursementInstance.kycCheck(hash, axiosBody);

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
