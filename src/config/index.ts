import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI,

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,

/** using for imageUpload */

/**local host url */
// imageUrl:"http://localhost:8050",

/**URL FOR UAT SERVER */
// imageUrl:"https://uataptpay.moreyeahs.in",
/**Ngrok url */
// imageUrl:"https://fe2c-103-15-67-125.ngrok.io",



  APTPAY_Sandbox_API : "https://sec.sandbox.aptpay.com/", //uat

  LIVE_API_Endpoint: "https://sec.aptpay.com/",
  //APTPAY_Sandbox_API : "https://sec.aptpay.com/", //live

  API_Key: "ohl9KWxW2rdtx9f3EEmhzQaoAdtQ8d",

  SECRET_KEY:"V_U$KrbTU5_sNOcr",

  add_kyc  :"/payees/:payee_id/kyc",

  keyApi : "odtQ8KWxW2rdtohl9EmhzQW2rdt",

  aptPayEmailofrPayment : "aptpay@email.com",

  aptoken : "tok_sandbox_8Nb3ToMThroCg2ND6ZgUvM",

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * Agenda.js stuff
   */
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: process.env.AGENDA_POOL_TIME,
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY, 10),
  },

  /**
   * Agendash config
   */
  agendash: {
    user: 'agendash',
    password: '123456'
  },
  /**
   * API configs
   */
  api: {
    prefix: '/api',
  },
  /**
   * Mailgun email credentials
   */
  emails: {
    apiKey: "64ff33efaa5670a19176e5582cda8db5-4b1aa784-b51e6e13",
    domain: "sandbox0d58635ae2aa418cae49325b5544df43.mailgun.org"
  },



};
