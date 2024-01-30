import nodemailer = require("nodemailer");
import mailHelpers from '../helpers/mail/mailHelpers'
export const transporter = nodemailer.createTransport({
  service: mailHelpers.host,
  secure: false,
  auth: {
    type: "login",
    user:mailHelpers.user,
    pass: mailHelpers.pass,
  },
});
transporter.verify().then(() => {
  console.log("listo para enviar emails");
});




