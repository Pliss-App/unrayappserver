const express = require('express');

const isRouter = express.Router();

const isController = require('../models/conductor');


isRouter.post('/create_travel', async (req, res) => {

    const create = await isController.createTravel(req.body.id_user_driver, req.body.id_user_passenger, req.body.id_service, req.body.descripcion, req.body.ayudante, req.body.tipo_vehiculo, req.body.address_initial, req.body.address_final, req.body.lat_initial, req.body.lng_initial, req.body.lat_final, req.body.lng_final, req.body.date_init, req.body.date_final, req.body.distance, req.body.total, req.body.status, req.body.status_travel
    );
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


isRouter.post('/create_travelDetail', async (req, res) => {

    const create = await isController.createTravelDetail(req.body);
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


isRouter.post('/recargar-billetera', async (req, res) => {
    try {
        const { iduser, boleta, monto, url } = req.body;
        const create = await isController.recargarBilletera(iduser, boleta, monto, url);
        if (create === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error'
            });
        } else {

            const insert = await  isController.insertMoviBilletera (iduser, monto, 'Recarga a Billetera', 'crédito');
            if (insert === undefined) {
                return res.status(200).send({
                    success: false,
                    msg: 'Error'
                });
            } else {
                return res.status(200).send({
                    success: true,
                    msg: 'SUCCESSFULLY',
                    result: create
                });
            }

        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/saldo-billetera/:id', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const user = await isController.saldoBilletera(req.params.id);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!user || Object.keys(user).length === 0) {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: { saldo: 0 } // Devolver saldo 0 si no hay registro
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: { saldo: user[0].saldo }
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})

isRouter.get('/movimientos/:id', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.movimientos(req.params.id);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})


isRouter.get('/detalle-vehiculo/:id', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.getDetalleVehiculo(req.params.id);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})


isRouter.get('/ganancias/:id/:fecha', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.GananciasDriver(req.params.id, req.params.fecha);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result[0]
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})

isRouter.get('/historial-ganancias/:id/:fecha', async (req, res) => {
    try {

        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.HistorialGananciasDriver(req.params.id, req.params.fecha);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})


isRouter.get('/metodospagos', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.metodopago();

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'En este momento no podemos mostrarte  la información de la cuenta.',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result[0]
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            success: false,
            msg: 'No pudimos completar la operación debido a un problema de comunicación con el servidor. Te sugerimos intentar nuevamente en unos momentos.'
        });
    }
})


isRouter.get('/callsecurity', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const result = await isController.callSecurity();

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'En este momento no podemos brindarte los número de seguridad',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            success: false,
            msg: 'No pudimos completar la operación debido a un problema de comunicación con el servidor. Te sugerimos intentar nuevamente en unos momentos.'
        });
    }
})


isRouter.get('/saldoMinimo', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
    
        const result = await isController.getSaldoMinimo();
        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(4001).send({
                success: false,
                msg: 'En este momento no podemos mostrarte la información.',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result[0]
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            success: false,
            msg: 'No pudimos completar la operación debido a un problema de comunicación con el servidor. Te sugerimos intentar nuevamente en unos momentos.'
        });
    }
})

module.exports = isRouter;