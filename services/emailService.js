require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('../config/environment');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendDietPDF(email, pdfPath, userName) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'Seu Plano Alimentar Personalizado - EasyNutri',
        text: `Olá ${userName},\n\nSegue em anexo seu plano alimentar personalizado.\n\nAtenciosamente,\nEquipe EasyNutri`,
        attachments: [{
          filename: 'plano-alimentar-easynutri.pdf',
          path: pdfPath
        }]
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();