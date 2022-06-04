import { Router, Request, Response, NextFunction, response } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { IUserInputDTO, IUserInputDTO2, IUserUpdateDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, errors, Joi } from 'celebrate';
import { Logger } from 'winston';
import Cryptojs from 'crypto-js';
import { IKycDTO } from '../../interfaces/Ikyc';
import config from '../../config';

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

var path = require('path');

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        mobile: Joi.string().allow(null),
        countryId: Joi.string().required(),
        occupation:Joi.string().required(),
        // profilePicture:Joi.string().required()
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
          occupation:req.body.occupation,
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

  route.post(
    '/sendinvitation',
    celebrate({
      body: Joi.object({
        email: Joi.string().required().email(),
      }),
    }),
    async (req: Request, res: Response) => {
      try {
        // const sendinvitation = Container.get(SendInvitation);
        const authServiceInstance = Container.get(AuthService);

        let userdata1 = await authServiceInstance.sendgMail(req.body as IUserInputDTO);

        return res.status(201).json({
          status: true,
          data: userdata1,
          // token: token,
          message: 'successfully sent',
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
    '/identities/:ID',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);

        var axiosBody = '';

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        var aptCard_Id = currentUser.aptCard_Id;
        let userdata1 = await authServiceInstance.getIdentity(hash, aptCard_Id);

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
    '/identities/add/requirements/:ID',
    middlewares.isAuth,
    middlewares.attachCurrentUser,

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);

        var axiosBody = '';

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        var aptCard_Id = currentUser.aptCard_Id;
        let userdata1 = await authServiceInstance.listOfRequiredIdentity(hash, aptCard_Id);

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
    '/kycDone',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        var currentUser = req.currentUser;
        console.log(currentUser);
        const authServiceInstance = Container.get(AuthService);

        const { kycData } = await authServiceInstance.isKycDone(currentUser.aptCard_Id);

        return res.status(201).json({
          status: true,
          data: kycData,
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
    '/socialSignup',
    celebrate({
      body: Joi.object({
        userid: Joi.string().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        mobile: Joi.string().required(),
        countryId: Joi.string().required(),
      }),
    }),

    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.socialSignup(req.body as IUserInputDTO);

        const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
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
        console.log('hash :', hash);

        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        await axios
          .post(`${config.APTPAY_Sandbox_API}payees/add`, axiosBody, options)
          .then(async Response => {
            console.log(Response);

            const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
            userdata1 = userdata;
          })
          .catch(error => {
            console.error(error);
            throw error.response.data.errors;
          });

        return res.status(201).json({
          status: true,
          data: userdata1,
          token: token,
          message: 'User Created!',
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        // return next(e);
        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post(
    '/verifyOtp',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        otp: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.verifyOtp(req.body.email, req.body.otp);
        return res.status(201).json({
          status: true,
          data: user,
          token: token,
          message: '',
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        // return next(e);

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post(
    '/reSendOtp',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const authServiceInstance = Container.get(AuthService);
        const { otpRecord } = await authServiceInstance.reSendOtp(req.body.email);
        return res.status(201).json({
          status: true,
          message: 'otp sent',
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        // return next(e);

        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post(
    '/socialSignin',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        userid: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling social Signin endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.socialSignin(req.body.email, req.body.userid);
        return res.status(200).json({
          status: true,
          data: user,
          token: token,
          message: 'User Signin successfully.',
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return res.status(200).send({
          status: false,
          message: `User Not registered`,
        });
      }
    },
  );

  route.post(
    '/signin',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);
      try {
        const { email, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignIn(email, password);
        return res.status(201).json({
          status: true,
          data: user,
          token: token,
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
    '/wList',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        notificationId: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);

      const authServiceInstance = Container.get(AuthService);
      const { wList } = await authServiceInstance.wList(req.body.email, req.body.notificationId);

      try {
        return res.status(200).json({
          status: true,
          message: 'data saved',
          data: wList,
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return res.status(201).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );

  route.post(
    '/aptverify/callback',

    celebrate({
      body: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        mobile: Joi.string().required(),
        countryId: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);

      try {
        const authServiceInstance = Container.get(AuthService);
        // const walletServiceInstance = Container.get(walletService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
          amount: req.body.amount,
        });
        console.log(axiosBody);

        let hash = await authServiceInstance.generateBodyHash(axiosBody);

        let userdata1 = await authServiceInstance.aptverifyCallback(hash, axiosBody);

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

  route.put(
    '/updateUserDetails',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        zip: Joi.string().required(),
        state: Joi.string().required(),
        street_line_2: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);

        var userdata1 = {};
        var axiosBody = JSON.stringify({
          street_line_2: req.body.street_line_2,
          country: req.body.country,
          street: req.body.street,
          city: req.body.city,
          zip: req.body.zip,
          state: req.body.state,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        await axios
          .put(`${config.APTPAY_Sandbox_API}payees/${currentUser.aptCard_Id}`, axiosBody, options)
          .then(async Response => {
            // console.log(`Response: ${Response}`);
            // console.log(Response.data.id);
            const { user } = await authServiceInstance.updateUserDetails(req.body as IUserUpdateDTO, currentUser._id);
            userdata1 = user;
          })
          .catch(error => {
            console.error(error);
            throw error.response.data.errors;
            userdata1 = error;
          });
        return res.status(201).json({
          status: true,
          data: userdata1,
          message: hash,
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

  route.get('/getActiveCountries', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const { country } = await authServiceInstance.getActiveCountries();
      return res
        .json({
          status: true,
          data: country,
          message: '',
        })
        .status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(200).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  route.get('/getAllusers', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const { users } = await authServiceInstance.getAllusers();
      return res
        .json({
          status: true,
          data: users,
          message: '',
        })
        .status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(200).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  route.post('/getUserByEmail', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const users = await authServiceInstance.getUserByEmail(req);
      console.log(users);

      if (users) {
        return res
          .json({
            status: true,
            data: users,
            message: 'success',
          })
          .status(200);
      } else {
        return res
          .json({
            status: false,
            data: users,
            message: 'data not available',
          })
          .status(202);
      }
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(201).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  route.post('/getUserByEmailSearch', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const { users } = await authServiceInstance.getUserByEmailSearch(req);
      return res
        .json({
          status: true,
          data: users,
          message: '',
        })
        .status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(200).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  route.get('/getOccupationList', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      const authServiceInstance = Container.get(AuthService);
      const  occupation1 = [ "Owner","Executive","Senior Manager","Manager/Supervisor","General Employee","Self-Employed",
      "Other (please specify)","Retired (no step 2)","Student (no step 2)","Unemployed (no step 2)"]
      const occupation2= ["Accounting and Bookkeeping","Administration or Office Support", "Aviation","Community Services/Charitable Organization",
    "Construction","Creative/Artist","Education and Training"," Embassy/Embassy Official","Engineering","Farming","Finance and Banking","Government",
    "Health Care and Medical"," Hospitality and Tourism","Information & Communication Technology","Insurance","Investments/Investor","Judiciary",
   " Legal/Lawyer","Manufacturing, Transport & Logistics","Marketing & Communications","Military"," Mining, Resources & Energy",
   " Police and Emergency Services","Real Estate"," Retail or Wholesale"," Sales and Marketing"," Science and Technology"]
      
      return res
        .json({
          status: true,
          data: {occupation1,occupation2},
          message: '',
        })
        .status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(200).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  route.get('/launchDate', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      var launchDate = new Date(2021, 6, 30);

      return res
        .json({
          status: true,
          launchDate: launchDate,
          message: '',
        })
        .status(200);
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
    '/AddActiveCountries',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        isActive: Joi.boolean().required(),
        isDelete: Joi.boolean().required(),
        countryCode: Joi.string().required(),
        flagUrl: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling AddActiveCountries endpoint with body: %o', req.body);
      try {
        const { name, isActive, isDelete, countryCode, flagUrl } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { Country } = await authServiceInstance.saveCountry(name, isActive, isDelete, countryCode, flagUrl);
        return res
          .json({
            status: true,
            data: Country,
            message: '',
          })
          .status(200);
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
    '/addKyc',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        identificationType: Joi.string().required(),
        identificationNumber: Joi.string().required(),
        identificationDate: Joi.date().required(),
        identificationDateOfExpiration: Joi.date().required(),
        identificationLocation: Joi.string().required(),
        virtual: Joi.boolean().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling addKyc endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const currentUser = req.currentUser;
        console.log(currentUser);

        const { kycRecord } = await authServiceInstance.addKyc(req.body as IKycDTO, currentUser._id);

        var axiosBody = JSON.stringify({
          identificationType: req.body.identificationType,
          identificationNumber: req.body.identificationNumber,
          identificationDate: req.body.identificationDate,
          identificationDateOfExpiration: req.body.identificationDateOfExpiration,
          identificationLocation: req.body.identificationLocation,
          virtual: req.body.virtual,
        });

        let hash = authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        const options = {
          headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'multipart/form-data', 'body-hash': hash },
        };

        // const data = new FormData();
        // data.append('identificationType',req.body.identificationType );
        // data.append('identificationNumber',req.body.identificationNumber);
        // data.append('identificationDate',req.body.identificationDate);
        // data.append('identificationDateOfExpiration',req.body.identificationDateOfExpiration);
        // data.append('identificationLocation',req.body.identificationLocation);
        // data.append('virtual',req.body.virtual);

        const data = new FormData();
        data.append('identificationType', 'PASSPORT');
        data.append('identificationNumber', '456789');
        data.append('identificationDate', '2020-02-04');
        data.append('identificationDateOfExpiration,', '2025-02-04');
        data.append('identificationLocation', 'Toronto, Canada');
        data.append('virtual', 'true');
        console.log(data);

        let hash2 = authServiceInstance.generateBodyHash(data);
        console.log('>>>>>>>>>>>>>>>>>>>', hash2);
        // await axios
        //   .post(`${config.APTPAY_Sandbox_API}payees/100/kyc`, data, options)
        //   .then(async Response => {
        //     console.log(`Response: ${Response}`);
        //     console.log(Response.data.id);
        //   })
        //   .catch(error => {
        //     console.error(error);
        //   });

        return res.status(201).json({
          status: true,
          data: kycRecord,
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

  route.get('/getCompanyConstants', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);
    try {
      if (req.query.keyApi == config.keyApi) {
        return res
          .json({
            status: true,
            API_Key: config.API_Key,
            APTPAY_Sandbox_API: config.APTPAY_Sandbox_API,
            LIVE_API_Endpoint: config.LIVE_API_Endpoint,
            add_kyc: config.add_kyc,
            aptPayEmailofrPayment: config.aptPayEmailofrPayment,
          })
          .status(200);
      } else {
        return res
          .json({
            success: false,
            message: 'wrong key',
          })
          .status(200);
      }
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(200).send({
        status: false,
        message: e.message,
        error: e,
      });
    }
  });

  /**
   * @TODO Let's leave this as a place holder for now
   * The reason for a logout route could be deleting a 'push notification token'
   * so the device stops receiving push notifications after logout.
   *
   * Another use case for advance/enterprise apps, you can store a record of the jwt token
   * emitted for the session and add it to a black list.
   * It's really annoying to develop that but if you had to, please use Redis as your data store
   */
  route.post('/logout', middlewares.isAuth, (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Out endpoint with body: %o', req.body);
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      return res
        .status(200)
        .json({
          status: true,
        })
        .end();
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });

  route.post('/getHash', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-In endpoint with body: %o', req.body);

    try {
      var axiosBody = JSON.stringify({ ...req.body });
      console.log('axiosBody', axiosBody);

      const authServiceInstance = Container.get(AuthService);
      let hash = authServiceInstance.generateBodyHash(axiosBody);
      console.log(hash);

      return res.status(201).json({
        status: true,
        data: { hash, body: req.body, axios: axiosBody },
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
    '/resetPassword',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        NewPassword: Joi.string().required(),
        confirmNewPassword: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authServiceInstance = Container.get(AuthService);
        let { user, message } = await authServiceInstance.resetPassword(req.body as IUserUpdateDTO);
        return res.status(201).send({
          status: true,
          data: user,
          message: message,
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
    '/changePassword',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        NewPassword: Joi.string().required(),
        oldpassword: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authServiceInstance = Container.get(AuthService);
        let { user, message } = await authServiceInstance.changePassword(req.body as IUserUpdateDTO);
        return res.status(201).send({
          status: true,
          data: user,
          message: message,
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

  route.put(
    '/updateUserProfiles',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        mobile: Joi.string().required(),
        profilePicture: Joi.any().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('updateUserProfile: %o', req.body);

      var currentUser = req.currentUser;
      console.log(currentUser);
      try {
        const authServiceInstance = Container.get(AuthService);

        var userdata1 = {};
        var axiosBody = JSON.stringify({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          mobile: req.body.mobile,
          profilePicture: req.body.profilePicture,
        });
        const { user } = await authServiceInstance.updateUserProfile(req.body as IUserUpdateDTO, currentUser._id);
        return res.status(201).json({
          status: true,
          data: user,
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
  // sender verification link API:
  route.post(
    '/identities/sendverificationlink',
    // middlewares.isAuth,
    // middlewares.attachCurrentUser,
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
        // console.log(currentUser);
        const authServiceInstance = Container.get(AuthService);

        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        const { userdata1 } = await authServiceInstance.sendverificationlink(axiosBody, hash, req.body);

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

  // unusualTransaction API:-
  route.post(
    '/reports/unusual-transaction',
    // middlewares.isAuth,
    // middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
          reportDate: Joi.date().iso(),
          activityDate:Joi.date().iso(),
          employeeName:Joi.string(),
          firstName:Joi.string(),
          lastName:Joi.string(),
          transactionLocation:Joi.string(),
          transactionDate:Joi.date().iso(),
          amount: Joi.number(),
          currency : Joi.string(),
          program: Joi.string(),
          transactionDescription:Joi.string(),
          actionTaken:Joi.string(),

    //       gender:Joi.string(),
    //       businessName:Joi.string(),
    //       relationsipToBusiness:Joi.string(),
    //       transactionCompleted:Joi.string(),
    //       statusOfAccount:Joi.string(),
    //       clientAccountNumber: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        var currentUser = req.currentUser;
        // console.log(currentUser);
        const authServiceInstance = Container.get(AuthService);

        var axiosBody = JSON.stringify({
          reportDate: req.body.reportDate,
          activityDate: req.body.activityDate,
          employeeName: req.body.employeeName,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          transactionLocation: req.body.transactionLocation,
          transactionDate: req.body.transactionDate,
          amount: req.body.amount,
          currency: req.body.currency,
          program: req.body.program,
          transactionDescription: req.body.transactionDescription,
          actionTaken: req.body.actionTaken,
          clientAccountNumber: req.body.clientAccountNumber,

          // clientAccountNumber: req.body.clientAccountNumber,
          // gender: req.body.gender,
          // businessName: req.body.businessName,
          // relationsipToBusiness: req.body.relationsipToBusiness,        
          // transactionCompleted: req.body.transactionCompleted,
          //  dateAccountOpened: req.body.dateAccountOpened,
          //  dateAccountClosed: req.body.dateAccountClosed,
          // statusOfAccount: req.body.statusOfAccount,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);
        const { userdata1 } = await authServiceInstance.UnusualTransaction(axiosBody, hash, req.body);

        return res.status(201).json({
          status: true,

          // token: token,
          message: 'unusual transaction created successfully',
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

  route.delete(
    '/closeAccount',
    // celebrate({
    //   body: Joi.object({
    //     _id: Joi.string().required(),
    //   }),
    // }),
    async (req: Request, res: Response, next: NextFunction) => {
      // const logger: Logger = Container.get('logger');
      // logger.debug('Calling Sign-In endpoint with body: %o', req.body);
      try {
        const { _id } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user } = await authServiceInstance.closeAccount(res, _id);
        return res.status(201).json({
          status: true,
          data: user,
          message: '',
        });
      } catch (e) {
        // logger.error('🔥 error: %o', e);
        return res.status(200).send({
          status: false,
          message: e.message,
          error: e,
        });
      }
    },
  );
};
