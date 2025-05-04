// utils/saveBase64File.js

const fs = require("fs");
const path = require("path");

const saveBase64File = (base64, nombreArchivo = "archivo") => {
  const matches = base64.match(/^data:(.*);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Formato base64 inválido");
  }

  const mimeType = matches[1]; // image/jpeg o video/mp4
  const extension = mimeType.split("/")[1]; // jpg o mp4
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const folder = mimeType.startsWith("image") ? "imagenes" : "videos";
  const fileName = `${Date.now()}-${nombreArchivo.replace(/\s/g, "_")}`;
  const uploadPath = path.join(__dirname, "../uploads", folder);
  const filePath = path.join(uploadPath, fileName);
  const urlPath = `/uploads/${folder}/${fileName}`;

  // Crear carpeta si no existe
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Guardar archivo
  fs.writeFileSync(filePath, buffer);

  return urlPath; // Devuelve la ruta para guardar en BD
};

module.exports = { saveBase64File };
