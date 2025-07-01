const express = require('express');
const isController = require('../../models/administracion/dashboard')
const isRouter = express.Router();


isRouter.get('/totales', async (req, res) => {
    try {
        const [viajes, usuarios, conductores, afiliaciones, recargas] = await Promise.all([
            isController.totalViajes(),
            isController.totalUsuarios(),
            isController.totalConductores(),
            isController.totalAfiliaciones(),
            isController.totalRecargas()
        ]);

        return res.status(200).json({
            success: true,
            msg: 'Datos obtenidos correctamente',
            result: {
                viajes,
                usuarios,
                conductores,
                afiliaciones,
                recargas
            },
        });

    } catch (error) {
        console.error('Error en /totales:', error);

        return res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

module.exports = isRouter;