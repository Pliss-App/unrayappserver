const express = require('express');
const OneSignal = require('../../models/onesignalModel')
const travelRouter = express.Router();

const travelController = require('../../models/administracion/bonificaciones');


travelRouter.post('/enviar-campania', async (req, res) => {
    const {userId, sonido, title, message, fecha, idUser} = req.body;
    try {
       const result = await OneSignal.sendNotification(userId, sonido, title, message, fecha, idUser, 'campania');
       if (result.id === undefined || result.id == '') {
            return res.status(200).send({
                success: false,
                msg: 'Error, no se pudo enviar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: create
            });
        }
    } catch (error) {
        console.log("EERROR ", error)
    }
})

travelRouter.get('/list-usuarios', async (req, res) => {
    try {
        const result = await travelController.getUsuarios()
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error)
    }

})

travelRouter.post('/create_travelDetail', async (req, res) => {

    const create = await travelController.createTravelDetail(req.body);
    if (create === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: create
        });
    }
})


// 🔹 Obtener todas las notificaciones
travelRouter.get('/listar', async (req, res) => {
  try {
    const result = await travelController.obtenerNotificaciones();
    res.status(200).send({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: 'Error al obtener notificaciones.', error });
  }
});

// 🔹 Crear nueva notificación
travelRouter.post('/crear', async (req, res) => {
  try {
    const data = req.body;
    const result = await travelController.insertarNotificacion(data);
    res.status(200).send({
      success: true,
      msg: 'Notificación creada exitosamente.',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: 'Error al crear notificación.', error });
  }
});

// 🔹 Obtener una notificación por ID
travelRouter.get('/detalle/:id', async (req, res) => {
  try {
    const result = await travelController.obtenerNotificaciones(req.params.id);
    res.status(200).send({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).send({ success: false, msg: 'Error al obtener detalle.', error });
  }
});

// 🔹 Actualizar notificación
travelRouter.put('/actualizar/:id', async (req, res) => {
  try {
    const result = await travelController.actualizarNotificacion(req.params.id, req.body);
    res.status(200).send({
      success: true,
      msg: 'Notificación actualizada exitosamente.',
      data: result
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: 'Error al actualizar notificación.', error });
  }
});

// 🔹 Eliminar notificación
travelRouter.delete('/eliminar/:id', async (req, res) => {
  try {
    const result = await travelController.eliminarNotificacion(req.params.id);
    res.status(200).send({
      success: true,
      msg: 'Notificación eliminada exitosamente.',
      data: result
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: 'Error al eliminar notificación.', error });
  }
});


module.exports = travelRouter;