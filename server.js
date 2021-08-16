const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

// Initiate app
const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const OAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
OAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Expose service endpoint
app.post('/send', async (req, res) => {

    // Create HTML output
    const output = `
            <h2>
                <u> New Contact Request </u>
            </h2>
            <h3> Contact details </h3>
            <ul>
                <li> 
                    <u> Name: </u> ${req.body.name} 
                </li>
                <li> 
                    <u> Email: </u> ${req.body.email} 
                </li>
            </ul>
            <h3> Message </h3>
            <p> ${req.body.message} </p>
        `;

    try {
        // Get access token from OAuth2
        const accessToken = await OAuth2Client.getAccessToken();

        // Set transport object
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        // Mail options
        const mailOptions = {
            from: 'MAILER <saharpe.mailer@gmail.com>',
            to: 'saharpe.dev@gmail.com',
            subject: '* New Contact Request *',
            html: output
        };

        // Send mail
        const result = await transport.sendMail(mailOptions);
        res.json({ message: result.messageId });
    } catch (err) {
        res.status(400).send({ message: err });
    }
});

// Run server on port
app.listen(process.env.PORT, () => console.log(`Server is running ..`));