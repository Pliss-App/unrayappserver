
const express = require('express');
const indexRouter = require('../controller/index');
const usuarioRouter = require('../controller/usuario');
const webuserRouter = require('../controller/web_user');
const travelRouter = require('../controller/travel');
const carouselRouter = require('../controller/carousel');
const docRouter = require('../controller/documentacion');
const condRouter = require('../controller/conductor');
const soliRouter = require('../controller/solicitud');
const dashboardRouter = require('../controller/administracion/dashboard');
const notiRouter = require('../controller/administracion/notificador');
const cuentaRouter = require('../controller/registro');
const billetera  =  require('../controller/administracion/billetera')
//const comercioRouter = require('../controller/comercio');
const locationRouter = require('../controller/location')
const firebRouter = require('../controller/firebase')
const brevoRouter = require('../controller/brevo')
const servicesRouter = require('../controller/services');
const solicitudes = require('../controller/procesarsolicitud')
const publicidad = require('../controller/administracion/publicidad')

// ####################################admin
const adminRouter = require('../controller/administracion/usuarios');
const afiRouter = require('../controller/administracion/documentacion');
const validateImage = require('../controller/ocr.controller')

const apiRouter = express.Router();

apiRouter.use('/init', indexRouter);
apiRouter.use('/user', usuarioRouter);
apiRouter.use('/web_user', webuserRouter);
apiRouter.use('/travel', travelRouter);
apiRouter.use('/carousel', carouselRouter);
apiRouter.use('/conductor', condRouter);
apiRouter.use('/documentacion', docRouter);
apiRouter.use('/viaje', soliRouter);
apiRouter.use('/cuenta',cuentaRouter);
//apiRouter.use('/comercio', comercioRouter);
apiRouter.use('/servicios', servicesRouter);
apiRouter.use('/solicitudes', solicitudes);
apiRouter.use('/location', locationRouter);
apiRouter.use('/auth', firebRouter);
apiRouter.use('/sms', brevoRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/publicidad', publicidad);

apiRouter.use('/admin/billetera', billetera);

apiRouter.use('/afiliacion', afiRouter);


apiRouter.use('/validateimage', validateImage);

apiRouter.use('/dashboard', dashboardRouter );
apiRouter.use('/noti',notiRouter );

module.exports = apiRouter;