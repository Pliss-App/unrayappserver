require('dotenv').config();
const path = require('path');
const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
const admin = require("firebase-admin");
const BUCKET = process.env.BUCKET;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET
});

const bucket = admin.storage().bucket();
const { v4: uuidv4 } = require('uuid');


const uploadImage = async (req, res, next) => {
    try {
      const { image, id } = req.body;
  
      if (!image || !id) {
        return res.status(400).json({ message: 'No se proporcionó imagen en base64' });
      }
  
   // Extraer el tipo mime y los datos en base64
   const matches = image.match(/^data:(.+);base64,(.+)$/);
   if (!matches || matches.length !== 3) {
     console.log('Invalid base64 format');
     return res.status(400).json({ message: 'Invalid base64 format' });
   }
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
  
      const extension = mimeType.split('/')[1];
      const fileName = `profile_id=${id}_${Date.now()}.${extension}`;
  
      const file = bucket.file('Perfiles/' + fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        },
      });
  
      stream.on("error", (err) => {
        console.error('Stream error:', err.message);
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      });
  
      stream.on("finish", async () => {
        try {
          await file.makePublic();
          const url = file.publicUrl();
  
          // Dejar datos en el request para que los use el endpoint
          req.file = { firebaseUrl: url };
          req.body.id_photo = fileName;
  
         
          next();
        } catch (error) {
          console.error('Error during making file public:', error.message);
          res.status(500).json({ message: 'Error during making file public', error: error.message });
        }
      });
  
      stream.end(buffer);
    } catch (error) {
        console.error('Error in uploadImage middleware:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };

const uploadChatSoporte = (req, res, next) => {
    try {
        if (!req.file) return next();
        const imagen = req.file;
        const nombreArquivo = Date.now() + "." + imagen.originalname.split(".").pop();
        const file = bucket.file('ChatSoporte/' + nombreArquivo);
        const stream = file.createWriteStream({
            metadata: {contentType: imagen.mimetype}
        })
        stream.on("error", (err) => {
            res.status(500).send({ message: err.message });
        })
        stream.on("finish", async () => {
            //archivo publico
            await file.makePublic().then(() => {
                const url = file.publicUrl()
                req.file.firebaseUrl = url;
                req.body.id_photo = nombreArquivo;
            });
            next();
        })
        stream.end(imagen.buffer);
    } catch (error) {
    }
}

//    const file = bucket.file('Products/Categoria_' + req.body.categoria + '/' + nombreArquivo);
const uploadProduct = (req, res, next) => {

    try {
        if (!req.file) return next();
        const imagen = req.file;
        const nombreArquivo = Date.now() + "_" + imagen.originalname.split(".").pop();
        const file = bucket.file('Products/Categoria_' + req.body.categoria + '/' + nombreArquivo);
        const stream = file.createWriteStream({
            metadata: {
                contentType: imagen.mimetype,
            }
        })
        stream.on("error", () => {
            res.status(500).send({ message: err.message });
        })
        stream.on("finish", async () => {
            //archivo publico
            await file.makePublic().then(() => {
                const url = file.publicUrl()
                req.file.firebaseUrl = url;
                req.body.id_photo = nombreArquivo;
            });
            next();
        })
        stream.end(imagen.buffer);
    } catch (error) {

    }

}

const uploadPagos = (req, res, next) => {
    if (!req.file) return next();
    const imagen = req.file;
    const nombreArquivo = Date.now() + "_" + imagen.originalname;
    const file = bucket.file('Pagos/' + nombreArquivo);
    const stream = file.createWriteStream({
        metadata: {
            contentType: imagen.mimetype,
        }
    })

    stream.on("error", () => {
        console.error(error)
    })

    stream.on("finish", async () => {
        //archivo publico
        await file.makePublic().then(() => {
            const url = file.publicUrl()
            req.file.firebaseUrl = url;
            req.body.id_photo = nombreArquivo;
        });
        next();
    })

    stream.end(imagen.buffer);
}

const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No image file');
        }

        const nombreArquivo = `${file.originalname}_${Date.now()}`;
        let fileUpload = bucket.file('Pagos/' + nombreArquivo);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            reject('Something is wrong! Unable to upload at the moment.');
        });

        blobStream.on('finish', async () => {
            // The public URL can be used to directly access the file via HTTP.
            await file.makePublic().then(() => {
                const url = file.publicUrl()
                req.file.firebaseUrl = url;
                req.body.id_photo = nombreArquivo;
            });
            next();
        });

        blobStream.end(file.buffer);
    });
}


const uploadImagePublicidad = async (req, res, next) => {
    try {
      const { image, id } = req.body;
  
      if (!image || !id) {
        return res.status(400).json({ message: 'No se proporcionó imagen en base64' });
      }
  
   // Extraer el tipo mime y los datos en base64
   const matches = image.match(/^data:(.+);base64,(.+)$/);
   if (!matches || matches.length !== 3) {
     console.log('Invalid base64 format');
     return res.status(400).json({ message: 'Invalid base64 format' });
   }
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
  
      const extension = mimeType.split('/')[1];
      const fileName = `publicidad_id=${id}_${Date.now()}.${extension}`;
  
      const file = bucket.file('Publicidad/' + fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        },
      });
  
      stream.on("error", (err) => {
        console.error('Stream error:', err.message);
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      });
  
      stream.on("finish", async () => {
        try {
          await file.makePublic();
          const url = file.publicUrl();
  
          // Dejar datos en el request para que los use el endpoint
          req.file = { firebaseUrl: url };
          req.body.id_photo = fileName;
  
          next();
        } catch (error) {
          console.error('Error during making file public:', error.message);
          res.status(500).json({ message: 'Error during making file public', error: error.message });
        }
      });
  
      stream.end(buffer);
    } catch (error) {
        console.error('Error in uploadImage middleware:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };


module.exports = {
    uploadImage,
    uploadProduct,
    uploadPagos,
    uploadImageToStorage,
    uploadChatSoporte,
    uploadImagePublicidad,
    bucket 
};