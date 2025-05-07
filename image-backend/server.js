require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json({ limit: '5mb' }));

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

app.post('/submit-image', async (req, res) => {
  const { image, text } = req.body;
  const base64Data = image.replace(/^data:image\/png;base64,/, '');

  try {
    await transporter.sendMail({
      from: `"Image Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,        // Where you want to receive images
      subject: 'New Image Submission',
      text: `Text: ${text}`,
      attachments: [
        {
          filename: 'submission.png',
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'image/png'
        }
      ]
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Email failed');
  }
});

app.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Image Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: 'Test Email from Mailgun',
      text: 'This is a test email sent from your Mailgun backend!'
    });
    res.send('Test email sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Test email failed');
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));