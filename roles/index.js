const express = require('express');
const indexRouter = require('../controller/index');
const usuarioRouter = require('../controller/usuario');
const webuserRouter = require('../controller/web_user');
const travelRouter = require('../controller/travel');
const carouselRouter = require('../controller/carousel');
const docRouter = require('../controller/documentacion');
const condRouter = require('../controller/conductor');
const soliRouter = require('../controller/solicitud');
//const comercioRouter = require('../controller/comercio');
const servicesRouter = require('../controller/services');
const solicitudes = require('../controller/procesarsolicitud')

// ####################################admin
const adminRouter = require('../controller/administracion/usuarios');


const apiRouter = express.Router();

apiRouter.use('/init', indexRouter);
apiRouter.use('/user', usuarioRouter);
apiRouter.use('/web_user', webuserRouter);
apiRouter.use('/travel', travelRouter);
apiRouter.use('/carousel', carouselRouter);
apiRouter.use('/conductor', condRouter);
apiRouter.use('/documentacion', docRouter);
apiRouter.use('/viaje', soliRouter);
//apiRouter.use('/comercio', comercioRouter);
apiRouter.use('/servicios', servicesRouter);
apiRouter.use('/solicitudes',solicitudes);

apiRouter.use('/admin',adminRouter);


module.exports = apiRouter;