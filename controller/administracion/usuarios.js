const express = require('express');

const isRouter = express.Router();

const isUController = require('../../models/administracion/usuarios');
const isCController = require('../../models/administracion/conductores');

isRouter.get('/usuarios/activos', async (req, res) => {

    try {
        const result = await isUController.getUsuariosActivos();
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
                    conductor: conductor,
                    vehiculo: vehiculo,
                    ubicacion:ubicacion
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
    const { conductor, vehiculo } = req.body;
    // Verificamos que lleguen datos
    if (!conductor || !vehiculo) {
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
                return res.status(200).send({
                    success: true,
                    msg: 'SUCCESSFULLY UPDATE'
                });
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


module.exports = isRouter;