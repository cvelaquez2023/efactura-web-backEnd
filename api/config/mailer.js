const nodemailer = require("nodemailer");

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  //debug: true,
  //logger: true,
});

transporter.verify().then(() => {
  console.log("LISTO EL SERVDIOR DE CORREOS");
});
module.exports = { transporter };
