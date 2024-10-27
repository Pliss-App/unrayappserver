const express = require('express');
const indexRouter = require('../controller/index');
const usuarioRouter = require('../controller/usuario');
const travelRouter = require('../controller/travel');
//const comercioRouter = require('../controller/comercio');
const servicesRouter = require('../controller/services');

const apiRouter = express.Router();

apiRouter.use('/init', indexRouter);
apiRouter.use('/user', usuarioRouter);
apiRouter.use('/travel', travelRouter);
//apiRouter.use('/comercio', comercioRouter);
apiRouter.use('/services', servicesRouter);

module.exports = apiRouter;