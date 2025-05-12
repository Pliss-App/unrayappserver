const express = require('express');
const webuserRouter = require('../controller/web_user');

const apiRouter = express.Router();

apiRouter.use('/web_user', webuserRouter);


module.exports = apiRouter;