// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.CLOUDNAME || "der2yfngs",
    api_key:  process.APIKEYCLOUD || "193537776941369",
    api_secret: process.APISECRETCLOUD || "FNTXppUhFLnadfScX-Vwts-M5XY",
});

module.exports = cloudinary;
