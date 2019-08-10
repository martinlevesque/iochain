var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'info@iochain.co',
    pass: process.env.MAIL_PW
  }}));

function send(to, subject, html) {
  const from_mail = 'info@iochain.co';

  return new Promise((resolve, reject) => {
    var mailOptions = {
      from: from_mail,
      to: to,
      subject: subject, // Subject line
      html: html // html body
    };

    console.log('---SENDING MAIL---');
    console.log(mailOptions);

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        reject(error);
      }
      else {
        resolve();
      }
    });
  });
}


module.exports = {
  send
};
