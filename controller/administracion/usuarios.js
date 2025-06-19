const express = require('express');
const { enviarCorreoActivacion } = require("../../utils/emailService"); // Importar el módulo
const OneSignal = require('../../models/onesignalModel')
const { enviarNotificacionFCM } = require('../../firebase');
const isRouter = express.Router();

const isUController = require('../../models/administracion/usuarios');
const isCController = require('../../models/administracion/conductores');
const isSController = require('../../models/administracion/soporte');
const isVController = require('../../models/administracion/viajes');
const isDController = require('../../models/administracion/documentacion');
const isBController = require('../../models/administracion/boletasBilletera');
const isNotController = require('../../models/administracion/notificador');
const isRefController = require('../../models/administracion/referidos');

isRouter.get('/usuarios/activos', async (req, res) => {
    try {
        const resultado = await isUController.getUsuariosActivos();
        if (resultado === undefined || resultado.length== 0) {
            return res.status(401).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: resultado
            });
        }

    } catch (error) {
        console.error(error);
                    return res.status(500).send({
                success: false,
                msg: 'Error en el servidor. Intenta más tarde',
            });
    }

})


isRouter.get('/conductores/activos', async (req, res) => {

    try {
        const result = await isCController.getActivos();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
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


isRouter.get('/conductores/servicios', async (req, res) => {

    try {
        const result = await isCController.getServicios();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
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

isRouter.get('/conductores/detalle-profile/:id', async (req, res) => {
    try {
        const results = await isCController.getConductorVehiculoId(req.params.id);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            const billetera = {
                saldo: results[0].saldo,
                reserva: results[0].reserva
            }

            const rating = {
                totalviajes: results[0].total_viajes,
                punteo: results[0].rating,
            }

            const conductor = {
                id: results[0].id,
                foto: results[0].foto,
                nombre: results[0].nombre,
                apellido: results[0].apellido,
                correo: results[0].correo,
                telefono: results[0].telefono,
                estado: results[0].estado,
                estado_usuario: results[0].estado_usuario,
                estado_eliminacion: results[0].estado_eliminacion,
                activacion: results[0].activacion
            };

            const vehiculo = {
                placas: results[0].placas,
                modelo: results[0].modelo,
                color: results[0].color,
            };

            const ubicacion = {
                direccion: results[0].direccion,
                municipio: results[0].municipio,
                departamento: results[0].departamento,
                pais: results[0].pais
            }

            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: {
                    rating: rating,
                    billetera: billetera,
                    conductor: conductor,
                    vehiculo: vehiculo,
                    ubicacion: ubicacion
                }
            });
        }

    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/conductores/detalle_vehiculo/:id', async (req, res) => {

    try {
        const result = await isCController.getConductorVehiculoId(req.params.id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result[0]
            });
        }

    } catch (error) {
        console.error(error)
    }
})


isRouter.put('/conductor/update/:id', async (req, res) => {
    const { id } = req.params;
    const { conductor, vehiculo, location } = req.body;
    // Verificamos que lleguen datos
    if (!conductor || !vehiculo || !location) {
        return res.status(400).json({ success: false, message: "Datos incompletos" });
    }
    try {

        const result = await isCController.updateProfileId(conductor, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            const results = await isCController.updateVehiculoId(vehiculo, id);
            if (results === undefined) {
                return res.status(200).send({
                    success: false,
                    msg: 'No se encontro data',
                });
            } else {

                const resul = await isCController.updateLocationId(location, id);
                if (resul === undefined) {
                    return res.status(200).send({
                        success: false,
                        msg: 'No se encontro data',
                    });
                } else {
                    return res.status(200).send({
                        success: true,
                        msg: 'SUCCESSFULLY UPDATE'
                    });
                }
            }
        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/conductores/departamentos', async (req, res) => {

    try {
        const result = await isCController.getDepartamentos();
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

isRouter.get('/conductores/municipios/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ success: false, message: "Datos incompletos" });
    }

    try {
        const result = await isCController.getMunicipios(id);
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

isRouter.get('/viajes/activos', async (req, res) => {
    try {
        const result = await isVController.getActivos();
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

isRouter.delete('/viajes/delete/:id/:idUser', async (req, res) => {
    try {
        const result = await isVController.deleteViaje(req.params.id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            const update = await isVController.liberarConductor(req.params.idUser);
            if (update === undefined) {
                return res.status(200).send({
                    success: false,
                    msg: 'No se encontro data',
                });
            } else {
                return res.status(200).send({
                    success: true,
                    msg: 'SUCCESSFULLY',
                });
            }
        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/documentacion/todo-estado/:item', async (req, res) => {
    try {
        const valor = req.params.item;
        var item = null;
        if (valor == 'recibido') {
            item = 'Recibido'
        } else if (valor == 'aprobado') {
            item = 'Aprobado'
        } else if (valor == 'rechazado') {
            item = 'Rechazado'
        }
        const results = await isDController.getTodas(item);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: results
            });
        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/documentacion/idUser/:id', async (req, res) => {
    try {

        const results = await isDController.getDocumentoId(req.params.id);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {


            const referencias = {
                nombrereferencia1: results[0].nombrereferencia1,
                parentescoreferencia1: results[0].parentescoreferencia1,
                contactoreferencia1: results[0].contactoreferencia1,
                nombrereferencia2: results[0].nombrereferencia2,
                parentescoreferencia2: results[0].parentescoreferencia2,
                contactoreferencia2: results[0].contactoreferencia2,
                fechaultactualizacion: results[0].fechaultactualizacion
            };

            const documentacion = {
                iduser: results[0].iduser,
                dpi_frontal: results[0].dpi_frontal,
                dpi_inverso: results[0].dpi_inverso,
                permiso_conducir: results[0].permiso_conducir,
                licencia_frontal: results[0].licencia_inverso,
                licencia_inverso: results[0].licencia_frontal,
                tarjeta_frontal: results[0].tarjeta_frontal,
                tarjeta_inverso: results[0].tarjeta_inverso,
                policiales: results[0].policiales,
                penales: results[0].penales,
                servicio: results[0].servicio,
                rostrodpi: results[0].rostrodpi,
                vehiculo_frontal: results[0].vehiculo_frontal,
                vehiculo_atras: results[0].vehiculo_atras,
                estado: results[0].estado,
                fecha: results[0].fecha,
                comentario: results[0].comentario
            };

            const usuario = {
                activacion: results[0].activacion,
                telefono: results[0].telefono,
                correo: results[0].correo,
                nombre: results[0].nombre,
                apellido: results[0].apellido,
                estado: results[0].estado,
                estado_usuario: results[0].estado_usuario,
                perfil: results[0].perfil,
                estado_perfil: results[0].estado_perfil,
            };

            const billetera = {
                saldo: results[0].saldo
            };


            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: {
                    documentacion: documentacion,
                    usuario: usuario,
                    billetera: billetera,
                    referencias: referencias
                }
            });
        }

    } catch (error) {
        console.error(error)
    }
})


isRouter.put('/activacion/conductor', async (req, res) => {
    try {

        const { id, correo, nombre, estado } = req.body;

        if (!correo) {
            return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
        }

        const results = await isDController.activarConductor(id, estado);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            await enviarCorreoActivacion(correo, nombre);
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY'
            });
        }
    } catch (error) {
        console.error(error)
    }
})




isRouter.put('/documentacion/actualizar-estado', async (req, res) => {
    try {

        const { id, estado, comentario } = req.body;

        if (!id || !estado) {
            return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
        }
        const results = await isDController.actualizarEstadoDocumentacion(id, estado, comentario);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY'
            });
        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/conductor/all-historial-billetera', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isCController.getHistorialBilletera(id)
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

isRouter.get('/conductor/historial-billetera', async (req, res) => {
    const { id, fechaInicio, fechaFin, tipo, tipo_search } = req.query;

    if (!id || !tipo_search) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {

        if (tipo_search == 'tipo') {
            const result = await isCController.getHistorialBilleteraTipo(id, tipo)
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

        } else if (tipo_search == 'fecha') {
            const result = await isCController.getHistorialBilleteraFecha(fechaInicio, fechaFin)
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

        } else if (tipo_search == 'fecha_tipo') {
            const result = await isCController.getHistorialBilleteraBusqueda(id, tipo, fechaInicio, fechaFin)
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
        }


    } catch (error) {
        console.error(error)
    }
})


isRouter.get('/conductor/viajes', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isCController.getViajesConductor(id)
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

isRouter.get('/conductor/viajes-fecha', async (req, res) => {
    const { id, fechaini, fechafin } = req.query;

    console.log(" d ", id, fechaini, fechafin)
    if (!id || !fechaini || !fechafin) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isCController.getViajesConductorFecha(id, fechaini, fechafin)
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


isRouter.get('/boletas/total', async (req, res) => {

    try {

        const result = await isBController.getTotal();
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


isRouter.get('/boletas/listar/:item', async (req, res) => {

    try {
        const item = req.params.item;
        var valor = null

        if (item == 'validacion') {
            valor = 'Validación'
        } else if (item == 'aprobado') {
            valor = 'Aprobado'
        } else {
            valor = 'Rechazado'
        }

        const result = await isBController.getActivos(valor);
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


isRouter.get('/boletas/filtrar', async (req, res) => {
    const { fecha, boleta, tipo_search } = req.query;

    if (!tipo_search) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {

        if (tipo_search == 'boleta') {
            const result = await isBController.getBoleta(boleta)
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

        } else if (tipo_search == 'fecha') {
            const result = await isBController.getFecha(fecha);
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

        }

    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/list-user-noti', async (req, res) => {
    try {
        const result = await isNotController.getUsuarios();
        if (!result || result.length === 0) {
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


isRouter.get('/boletas/gestionar-id=:id', async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isBController.getBoletaId(req.params.id);
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result[0]
            });
        }

    } catch (error) {
        console.error(error)
    }
})


isRouter.put('/boletas/update', async (req, res) => {
    const { id, estado, comentario } = req.body
    if (!id || !estado) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isBController.updateBoletaId(id, estado, comentario);
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'UPDATE SUCCESSFULLY',
            });
        }

    } catch (error) {
        console.error(error)
    }
})


isRouter.post('/enviar-campania', async (req, res) => {
    const { userId, sonido, title, message, fecha, idUser } = req.body;
    try {
        const result = await OneSignal.sendNotificationAdmin(userId, sonido, title, message, fecha, idUser, 'campania');
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error, no se pudo enviar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("EERROR ", error)
    }
})

isRouter.get('/list-referidos', async (req, res) => {

    try {
        const result = await isRefController.getUsuarios();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error, no se pudo enviar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("EERROR ", error)
    }
})

isRouter.put('/referencias-actualizacion', async (req, res) => {
    try {

        const { nombrereferencia1, nombrereferencia2, contactoreferencia1, contactoreferencia2, parentescoreferencia1, parentescoreferencia2, id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
        }

        const results = await isUController.actualizarReferencias(nombrereferencia1, nombrereferencia2, contactoreferencia1, contactoreferencia2, parentescoreferencia1, parentescoreferencia2, id)
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY'
            });
        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.put('/update-foto-perfil-conductor', async (req, res) => {
    try {

        const { foto, estado, idDoc, idUser } = req.body;

        if (!idDoc || !idUser) {
            return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
        }

        const results = await isUController.actualizarEstadoFotoConductor(estado, idDoc);
        if (results === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {

            if (estado == 'Aprobado') {
                const results = await isUController.actualizarFotoConductor(foto, idUser);
                if (results === undefined) {
                    return res.status(200).send({
                        success: false,
                        msg: 'No se encontro data',
                    });
                } else {

                    return res.status(200).send({
                        success: true,
                        msg: 'SUCCESSFULLY'
                    });
                }

            } else {
                return res.status(200).send({
                    success: true,
                    msg: 'SUCCESSFULLY'
                });
            }

        }
    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/costo/viajes', async (req, res) => {

    try {
        const result = await isUController.listCostoViajes();
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

//    updatePreciosKM,

isRouter.put('/updatePreciosKM', async (req, res) => {
    const { min_km, max_km, costo_base, precio_km, id, idservicio } = req.body
    if (!id || !idservicio) {
        return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
    }

    try {
        const result = await isUController.updatePreciosKM(min_km, max_km, costo_base, precio_km, id, idservicio);
        if (!result || result.length === 0) {
            return res.status(400).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'UPDATE SUCCESSFULLY',
            });
        }

    } catch (error) {
        console.error(error)
    }
})



isRouter.get('/comunity', async (req, res) => {

    try {
        const result = await isUController.getComunity();
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

});

isRouter.get('/getPerfilUsuario/:id', async (req, res) => {

    try {
        const result = await isUController.getPerfilUsuario(req.params.id);
        if (result === undefined) {
            return res.status(400).send({
                success: false,
                msg: 'En este momento no podemos brindarte información de este perfil. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result[0]
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }

})


isRouter.get('/estadoActivacionConductor/:id', async (req, res) => {

    try {

        const result = await isDController.estadoActivacionConductor(req.params.id)
        if (result === undefined || result.length == 0) {
            return res.status(404).send({
                success: false,
                msg: 'No se puedo recuperar la información de Estado de Activación del CONDUCTOR. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result[0]
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Ocurrió un error inesperado en el servidor.',
        });
    }

});





isRouter.put('/updateVehiculo', async (req, res) => {
    const { id, placas, modelo, color } = req.body;

    if (!id || !placas || !modelo || !color) {
        return res.status(400).json({ success: false, message: "Faltan datos del vehiculo" });
    }
    try {
        const result = await isCController.updateDatoVehiculo(id, placas, modelo, color);
        if (!result || result.length === 0) {
            return res.status(400).send({
                success: false,
                msg: 'No pudimos encontrar el registro indicado. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'UPDATE SUCCESSFULLY',
            });
        }

    } catch (error) {
        console.error(error)
    }
})


isRouter.get('/conductores/activados', async (req, res) => {

    try {
        const result = await isCController.getConductoresActivados();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error, intenta más tarde...',
        });
    }
})


isRouter.get('/conductores/noactivados', async (req, res) => {

    try {
        const result = await isCController.getConductoresNoActivados();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error, intenta más tarde...',
        });
    }
})


isRouter.get('/conductores/enlinea', async (req, res) => {

    try {
        const result = await isCController.getConductoresEnLinea();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error, intenta más tarde...',
        });
    }
})


isRouter.get('/conductores/fueradelinea', async (req, res) => {

    try {
        const result = await isCController.getConductoresFueradeLinea();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error, intenta más tarde...',
        });
    }
})


isRouter.get('/conductores/seguimientoCoordenadas', async (req, res) => {

    try {
        const result = await isCController.getMovimientosConductores();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error, intenta más tarde...',
        });
    }
})


isRouter.put('/porcentajes/app', async (req, res) => {
    try {

        const { porApp, porCond, id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
        }

        const results = await isCController.updatePorcentajes(porApp, porCond, id);
        if (results === undefined) {
            return res.status(401).send({
                success: false,
                msg: 'No se pudo encontrar la información solicitada. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }
})


isRouter.get('/porcentajes/app', async (req, res) => {
    try {

        const results = await isCController.getPorcentajes();
        if (results === undefined || results.length == 0) {
            return res.status(401).send({
                success: false,
                msg: 'No se pudo encontrar la información solicitada. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: results
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }
})

isRouter.get('/soporte/revision', async (req, res) => {
    try {
        const results = await isSController.getSoporteUsuario();
        if (results === undefined || results.length == 0) {
            return res.status(401).send({
                success: false,
                msg: 'No se pudo encontrar la información solicitada. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: results
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }
})

isRouter.get('/soporte/:id', async (req, res) => {
    try {

        const results = await isSController.getSoporteUsuarioId(req.params.id);
        if (results === undefined || results.length == 0) {
            return res.status(401).send({
                success: false,
                msg: 'No se pudo encontrar la información solicitada. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: results[0]
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }
})


isRouter.put('/soporte/update', async (req, res) => {
    const { estado, id, idUser } = req.body;
    try {

        const results = await isSController.updateSoporteUsuario(estado, id, idUser);
        if (results === undefined || results.length == 0) {
            return res.status(401).send({
                success: false,
                msg: 'No se pudo encontrar la información solicitada. Intenta más tarde.',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor. Intenta más tarde.',
        });
    }
})



isRouter.post('/enviar-campania-prueba', async (req, res) => {
  const { token, idViaje, origin, destination, price, user, url, idUser } = req.body;
  try {
    const result = await enviarNotificacionFCM(token, idViaje, origin, destination, price, user, url, idUser);

    if (!result) {
      return res.status(200).send({
        success: false,
        msg: 'Error, no se pudo enviar',
      });
    } else {
      return res.status(200).send({
        success: true,
        msg: 'SUCCESSFULLY',
        responseId: result // Puedes enviar el ID de mensaje de FCM
      });
    }
  } catch (error) {
    console.error("❌ Error en endpoint:", error);
    return res.status(500).send({
      success: false,
      msg: 'Error interno del servidor'
    });
  }
})
module.exports = isRouter;