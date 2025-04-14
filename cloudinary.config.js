const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configura con tus credenciales
cloudinary.config({
  cloud_name: process.CLOUDNAME || "der2yfngs",
  api_key:  process.APIKEYCLOUD || "193537776941369",
  api_secret: process.APISECRETCLOUD || "FNTXppUhFLnadfScX-Vwts-M5XY",
});

// Configuración del storage para multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Puedes cambiarlo por el nombre de tu carpeta en Cloudinary
    resource_type: "auto", // Detecta si es imagen o video automáticamente
  },
});

module.exports = {
  cloudinary,
  storage,
};
