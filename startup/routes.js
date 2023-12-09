const express = require('express');
const indexRouter = require('../routes/index');
const usuarioRouter = require('../routes/usuario');
const travelRouter = require('../routes/travel');
const comercioRouter = require('../routes/comercio');
const servicesRouter = require('../routes/services');

const apiRouter = express.Router();

apiRouter.use('/init', indexRouter);
apiRouter.use('/user', usuarioRouter);
apiRouter.use('/travel', travelRouter);
apiRouter.use('/comercio', comercioRouter);
apiRouter.use('/services', servicesRouter);

module.exports = apiRouter;