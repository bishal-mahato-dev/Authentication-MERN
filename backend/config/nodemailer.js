import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // ✅ Use Gmail service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // ✅ This should be a 16-character Gmail App Password
  },
});

export default transporter;
