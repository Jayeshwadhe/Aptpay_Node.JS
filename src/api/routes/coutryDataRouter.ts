import { Router, Request, Response } from 'express';
import middlewares from '../middlewares';
import config from '../../config';
import { relativeTimeRounding } from 'moment';
import { celebrate, Joi } from 'celebrate';
import cards from '../../models/prepaid';
import countryDataService from '../../services/countryDataService';
import AuthService from '../../services/auth';

import { Container } from 'typedi';
import { IcountryDataInput } from '../../interfaces/ICountryData';
import { Logger } from 'winston';

const axios = require('axios');
const route = Router();

export default (app: Router) => {
  app.use('/countryData', route);

  route.post('/countryDataDetails',
   
    async (req: Request, res: Response) => {
      try {
        const countryDataServiceInstance = Container.get(countryDataService);
        const authServiceInstance = Container.get(AuthService);
        // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
        var axiosBody = JSON.stringify({
          payeeId: req.body.payeeId,
        });

        let hash = await authServiceInstance.generateBodyHash(axiosBody);
        console.log('>>>>>>>>>>>>>>>>>>>', hash);

        let userdata1 = await countryDataServiceInstance.countryData(hash, axiosBody);

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

  route.get('/getCountryDataDetails',
   
  async (req: Request, res: Response) => {
    try {
      const countryDataServiceInstance = Container.get(countryDataService);
      const authServiceInstance = Container.get(AuthService);
      // const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
      // const { countryData } = await authServiceInstance.countryByCode(req.body.countryId);
      var axiosBody = JSON.stringify({
        payeeId: req.body.payeeId,
      });

      let hash = await authServiceInstance.generateBodyHash(axiosBody);
      console.log('>>>>>>>>>>>>>>>>>>>', hash);

      let userdata1 = await countryDataServiceInstance.getCountryData(hash, axiosBody);

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

 


  


};
