// config/cloudinaryStorage.js
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // nombre de la carpeta en Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi"],
    resource_type: "auto", // permite subir imagen o video
  },
});

module.exports = storage;
