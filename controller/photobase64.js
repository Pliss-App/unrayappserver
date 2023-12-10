const fs = require('fs')

const toBase64 = (filePath) => {
    const img = fs.readFileSync(filePath);

    return Buffer.from(img).toString('base64');
}

module.exports = {
    toBase64
}