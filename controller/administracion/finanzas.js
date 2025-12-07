const express = require('express');
const OneSignal = require('../../models/onesignalModel')
const { enviarNotificacionFCM } = require('../../firebase');
const isRouter = express.Router();

const isController = require('../../models/administracion/finanzas');

isRouter.get('/rango', async (req, res) => {
    try {
        const { fecha_ini, fecha_fin } = req.query;
        const result = await isController.getTotalSinFiltros(fecha_ini, fecha_fin);
        return res.status(200).json({
            success: true,
            msg: "Listado generado",
            result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: "Error del servidor"
        });
    }
});


isRouter.get('/boletas/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const result = await isController.getBoletaById(id);

        if (!result)
            return res.status(404).json({ success: false, msg: "No existe boleta" });

        return res.status(200).json({
            success: true,
            msg: "Boleta encontrada",
            result
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, msg: "Error del servidor" });
    }
});

isRouter.patch('/boletas/:id/validar', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, comentario } = req.body;

        if (!["APROBADA", "RECHAZADA"].includes(estado)) {
            return res.status(400).json({ success: false, msg: "Estado inválido" });
        }

        const result = await isController.actualizarEstado(id, estado, comentario);

        return res.status(200).json({
            success: true,
            msg: "Estado actualizado",
            result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Error del servidor" });
    }
});

isRouter.patch('/boletas/:id/acreditar', async (req, res) => {
    try {
        const { id } = req.params;

        const boleta = await isController.getBoletaById(id);
        if (!boleta)
            return res.status(404).json({ success: false, msg: "Boleta no existe" });

        if (boleta.estado !== "APROBADA")
            return res.status(400).json({
                success: false,
                msg: "El depósito no está aprobado"
            });

        await isController.acreditarSaldo(boleta.iduser, boleta.monto);

        return res.status(200).json({
            success: true,
            msg: "Saldo acreditado"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Error del servidor" });
    }
});

isRouter.post('/boletas/:id/notificar', async (req, res) => {

    try {
        const { id } = req.params;

        const boleta = await isController.getBoletaById(id);
        if (!boleta)
            return res.status(404).json({ success: false, msg: "Boleta no encontrada" });

        const msg =
            boleta.estado === "APROBADA"
                ? "Tu depósito fue aprobado y acreditado."
                : "Tu depósito fue rechazado. Revisa las observaciones.";

        await OneSignal.sendNotification(boleta.iduser, msg);

        return res.status(200).json({
            success: true,
            msg: "Notificación enviada"
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Error enviando notificación" });
    }
});


module.exports = isRouter;