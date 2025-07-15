require('dotenv').config();
const axios = require('axios');

const sendWhatsAppTemplate = async (to, code) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: 'codigo_verificacion',
          language: {
            code: 'es',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: code,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Mensaje enviado:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

module.exports = { sendWhatsAppTemplate };
