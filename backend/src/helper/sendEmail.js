import nodemailer from "nodemailer";
import { smtpPassword, smtpUsername } from "../secret.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // or 465 if needed
  secure: false, // Use `true` for port 465, `false` for other ports
  auth: {
    user: smtpUsername,
    pass: smtpPassword
  }
});

const sendEmailWithNodemailer = async (emailData = {}) => {
  try {
    const mailOption = {
      from: smtpUsername, // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html // html body
    };
    await transporter.sendMail(mailOption);
  } catch (error) {
    console.log("Error is occurred from sendWithNodeMailer Function", error);
    throw error;
  }
};

export { sendEmailWithNodemailer };
