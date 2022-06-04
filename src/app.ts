import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';

import express from 'express';

import Logger from './loaders/logger';




const path = require('path');

async function startServer() {
  const app = express();

  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger.json');
    
app.use(express.static('public')); 
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // app.use('/upload',express.static(path.join(__dirname, '/uploads')));
  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/

  //route to download a file
  app.get('/download/:file(*)', (req, res) => {
    var file = req.params.file;
    var fileLocation = path.join('./src/uploads', file);
    console.log(fileLocation);
    res.download(fileLocation, file);
  });


  app.get('/view/:file(*)', (req, res) => {
    var file = req.params.file;

    var fileLocation = path.join('./uploads', file);
    console.log(__dirname + "/uploads/Privacy.html");
    res.sendFile(__dirname + "/uploads/Privacy.html");
  });

  await require('./loaders').default({ expressApp: app });

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();
