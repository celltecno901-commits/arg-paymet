const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/procesar-pago', async (req, res) => {
    const { codigo_recarga } = req.body;

    const id_secreto = process.env.ID_SECRETO || "1071";

    if (!codigo_recarga) {
        return res.status(400).json({ exito: false, mag: "falta el codigo de recarga" });
    }

    try {
        const url_externa = `https://argserver.com{encodeURIComponent(codigo_recarga)}&id=${encodeURIComponent(id_secreto)}`;
        const respuesta = await axios.get(url_externa);

        if (respuesta.data && respuesta.data.status === 'ok') {
            return res.json({ exito: true, mag: "Recarga aprobada automáticamente" });
        } else {
            const mensaje_error = respuesta.data && respuesta.data.mag ? respuesta.data.mag : "código inválido o ya utilizado.";
            return res.status(400).json({ exito: false, mag: mensaje_error });
        }
    } catch (error) {
        console.error("Error al conectar con el validador:", error.message);
        return res.status(500).json({ exito: false, mag: "Error interno al conectar con el servidor de recargas" });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor de autopago corriendo en http://localhost:${PORT}`);
});