const express = require('express');
const indexRouter = require('../controller/index');
const usuarioRouter = require('../controller/usuario');
const webuserRouter = require('../controller/web_user');
const travelRouter = require('../controller/travel');
const carouselRouter = require('../controller/carousel');
//const comercioRouter = require('../controller/comercio');
const servicesRouter = require('../controller/services');

const apiRouter = express.Router();

apiRouter.use('/init', indexRouter);
apiRouter.use('/user', usuarioRouter);
apiRouter.use('/web_user', webuserRouter);
apiRouter.use('/travel', travelRouter);
apiRouter.use('/carousel', carouselRouter);
//apiRouter.use('/comercio', comercioRouter);
apiRouter.use('/servicios', servicesRouter);

module.exports = apiRouter;