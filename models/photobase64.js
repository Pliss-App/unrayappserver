
const axios = require('axios')

const toBase64 = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
              });
          
              const contentType = response.headers['content-type'];
          
              const base64String = `data:${contentType};base64,${Buffer.from(
                response.data,
              ).toString('base64')}`;
          
        
            resolve(base64String)
          } catch (err) {
            console.log(err);
          }
        })
}

module.exports = {
    toBase64
}