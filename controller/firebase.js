const express = require('express');
const fetch = require('node-fetch'); // ahora sí es válido
const router = express.Router();

const firebaseRouter = express.Router();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

firebaseRouter.post('/send-code', async (req, res) => {

  const { phoneNumber , recaptchaToken } = req.body;
  console.log(" -- ", phoneNumber, recaptchaToken )
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        recaptchaToken 
      })
    });

    const data = await response.json();
    if (response.ok) {
      res.json({ sessionInfo: data.sessionInfo });
    } else {
      res.status(400).json({ error: data.error.message });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});


module.exports = firebaseRouter;