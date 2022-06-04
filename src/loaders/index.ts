import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import jobsLoader from './jobs';
import Logger from './logger';
//We have to import at least all the events once so they can be triggered
import './events';

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info('✌️ DB loaded and connected! DB name ---' + mongoConnection.databaseName);

  /**
   * WTF is going on here?
   *
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */

  const userModel = {
    name: 'userModel',
    // Notice the require syntax and the '.default'
    model: require('../models/user').default,
  };

  const countryModel = {
    name: 'countryModel',
    // Notice the require syntax and the '.default'
    model: require('../models/country').default,
  };

  const otpModel = {
    name: 'otpModel',
    // Notice the require syntax and the '.default'
    model: require('../models/otpSchema').default,
  };

  const kycModel = {
    name: 'kycModel',
    // Notice the require syntax and the '.default'
    model: require('../models/kyc').default,
  };

  const prepaidModel = {
    name: 'prepaidModel',
    // Notice the require syntax and the '.default'
    model: require('../models/prepaid').default,
  };

  const WaitListModel = {
    name: 'WaitListModel',
    // Notice the require syntax and the '.default'
    model: require('../models/waitList').default,
  };

  const companyConstantsModel = {
    name: 'companyConstantsModel',
    // Notice the require syntax and the '.default'
    model: require('../models/companyConstants').default,
  };


  const disbursementModel = {
    name: 'disbursementModel',
    // Notice the require syntax and the '.default'
    model: require('../models/disbursement').default,
  };

  const disbursementInstrument = {
    name: 'disbursementInstrument',
    // Notice the require syntax and the '.default'
    model: require('../models/disbursementInstrument').default,
  };

  const crossborderModel = {
    name: 'crossborderModel',
    // Notice the require syntax and the '.default'
    model: require('../models/corssborderModel').default,
  };
  const partnersModel = {
    name: 'partnersModel',
    // Notice the require syntax and the '.default'
    model: require('../models/partnersModel').default,
  };
  const notificationsModel = {
    name: 'notificationsModel',
    // Notice the require syntax and the '.default'
    model: require('../models/notificationsModel').default,
  };

  const countryDataModel = {
    name: 'countryDataModel',
    // Notice the require syntax and the '.default'
    model: require('../models/countryDataModel').default,
  };

  const walletModel = {
    name: 'walletModel',
    // Notice the require syntax and the '.default'
    model: require('../models/walletModel').default,
  };

  const webhooksModels = {
    name: 'webhooksModels',
    // Notice the require syntax and the '.default'
    model: require('../models/webhooks').default,
  };

  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [userModel, countryModel, otpModel, kycModel, WaitListModel, companyConstantsModel,disbursementModel, prepaidModel,
      crossborderModel,disbursementInstrument,partnersModel,notificationsModel,countryDataModel,walletModel,webhooksModels
    ],
  });
  Logger.info('✌️ Dependency Injector loaded');

  await jobsLoader({ agenda });
  Logger.info('✌️ Jobs loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
