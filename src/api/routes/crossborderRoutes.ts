import { Router, Request, Response, NextFunction, response } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import cards from '../../models/prepaid';
import crossborderService from '../../services/crossborderService';
import AuthService from '../../services/auth';
import crossborderModel from '../../models/corssborderModel';
import { IUserInputDTO, IUserInputDTO2, IUserUpdateDTO } from '../../interfaces/IUser';
import { Container } from 'typedi';
import { ICrossborderInput } from '../../interfaces/ICrossborder';
import { Logform, Logger } from 'winston';
import countryDataModel from '../../models/countryDataModel';
import { Console } from 'console';

const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/crossborder', route);

  route.post(
    '/createTransaction',
    celebrate({
      body: Joi.object({
        receiver: {
          payeeId: Joi.number().required(),
        },
        transaction: {
          amount: Joi.number().required(),
          paymentMode: Joi.string().required(),
          sourceCurrency: Joi.string().required(),
          receiveCurrency: Joi.string().required(),
          account: Joi.string().required(),
          branch: Joi.string().required(),
          accountType: Joi.string().required(),
          purpose: Joi.string().required(),
          sourceOfFunds: Joi.string().required(),
        },
      }),
    }),
    async (req: Request, res: Response) => {
      try {
        const crossborderServiceInstance = Container.get(crossborderService);
        const authServiceInstance = Container.get(AuthService);

        var axiosBody = JSON.stringify({
          receiver: req.body.receiver,
          transaction: req.body.transaction,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        let payeeId = req.body.receiver.payeeId;
        let userdata1 = await crossborderServiceInstance.createTransaction(hash, axiosBody, payeeId);

        return res.status(201).json({
          status: true,
          data: userdata1,
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
    '/newRecipient',
    celebrate({
      body: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        mobile: Joi.string().allow(null),
        countryId: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        street_line_2: Joi.string().required(),
        zip: Joi.string().required(),
        state: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);

        const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
        console.log('................................................', countryData.name);

        var userdata1 = {};
        var axiosBody = JSON.stringify({
          individual: true,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          country: countryData.name,
          phone: countryData.countryCode + req.body.mobile,
          clientId: user._id,
          program: 1,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);

        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        await axios
          .post(`${config.APTPAY_Sandbox_API}payees/add`, axiosBody, options)
          .then(async Response => {
            // console.log(`Response: ${JSON.stringify(Response)}`);
            for (const akey in Response) {
              console.log(akey, ':\t', Response[akey]);
            }
            console.log('2', Response.data.id);

            const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
            userdata1 = userdata;
          })
          .catch(error => {
            // console.error(error.response.data.errors);
            throw error.response.data.errors;
          });
        return res.status(201).json({
          status: true,
          data: userdata1,
          token: token,
          message: '',
        });
      } catch (e) {
        // logger.error('🔥 error: %o', e);
        console.log(e);

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.get('/getCountryServices', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    try {
      const crossborderServiceInstance = Container.get(crossborderService);
      const authServiceInstance = Container.get(AuthService);
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      let userdata2 = await crossborderServiceInstance.getCountryData(hash, axiosBody);
      return res.status(201).json({
        status: true,
        data: userdata2,
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

  route.get('/getSorcesOfFunds', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/sources-of-funds`, options)
        .then(async Response => {
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/type-of-ids/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';

      let hash = authServiceInstance.generateBodyHash(axiosBody);

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/type-of-ids/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
          console.error(error.response.data);
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
  });

  route.get('/type-of-ids-receiver/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/type-of-ids-receiver/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/type-of-accounts/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/type-of-accounts/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/cities/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';

      let hash = authServiceInstance.generateBodyHash(axiosBody);

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/cities/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/banks/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';

      let hash = authServiceInstance.generateBodyHash(axiosBody);

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/banks/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/bank/:bankId/branches', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';

      let hash = authServiceInstance.generateBodyHash(axiosBody);

      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/bank/${req.params.bankId}/branches`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.get('/purposes/:country', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.params);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(`${config.APTPAY_Sandbox_API}crossborder/purposes/${req.params.country}`, options)
        .then(async Response => {
          // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
          userdata1 = Response.data;
        })
        .catch(error => {
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

  route.post('/getPayers', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(
          `${config.APTPAY_Sandbox_API}crossborder/payers/${req.body.country}?paymentMode=${req.body.paymentMode}&receiveCurrency=${req.body.receiveCurrency}&sourceCurrency=${req.body.sourceCurrency}&cityId=${req.body.cityId}`,
          options,
        )
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
  });

  route.post('/calculate', async (req: Request, res: Response) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

    try {
      const authServiceInstance = Container.get(AuthService);
      var userdata1 = {};
      var axiosBody = '';
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      const options = {
        headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
      };

      await axios
        .get(
          `${config.APTPAY_Sandbox_API}crossborder/calculate/?paymentMode=${req.body.paymentMode}&receiveCurrency=${req.body.receiveCurrency}&sourceCurrency=${req.body.sourceCurrency}&receiveCountry=${req.body.receiveCountry}&sentAmount=${req.body.sentAmount}&cityId=${req.body.cityId}&bankId=${req.body.bankId}`,
          options,
        )
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

  route.post(
    '/exchangeRate',
    celebrate({
      body: Joi.object({
        sourceCurrency: Joi.string(),
        receiveCountry: Joi.string(),
      }),
    }),
    async (req: Request, res: Response) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      try {
        const authServiceInstance = Container.get(AuthService);
        var userdata1 = {};
        var axiosBody = '';
        let hash = authServiceInstance.generateBodyHash(axiosBody);
        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        await axios
          .get(
            `${config.APTPAY_Sandbox_API}crossborder/exchange-rate?sourceCurrency=${req.body.sourceCurrency}&receiveCountry=${req.body.receiveCountry}`,
            options,
          )
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
    },
  );

  route.get(
    '/getIBAN',
    async (req: Request, res: Response) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      try {
        const authServiceInstance = Container.get(AuthService);
        var userdata1 = {};
        var axiosBody = '';
        // let hash = authServiceInstance.generateBodyHash(axiosBody);
        const options = {
          headers: {
            Accept: 'application/json',
            'X-Api-Key': 'sk_a3a1cac989336afb923610031effb66af2c5d13243ca7a57af55b36de40e7ddf',
          },
        };

        await axios
          .get(`https://swiftcodesapi.com/v1/ibans/FR7630006000011234567890189`, options)
          .then(async Response => {
            console.log(Response.json());
            // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
            userdata1 = Response;
          })
          .catch(error => {
            userdata1 = error;
            console.error(error);
            // throw new Error(error.response);
          });

        return res.status(201).json({
          status: true,
          data: response,
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
