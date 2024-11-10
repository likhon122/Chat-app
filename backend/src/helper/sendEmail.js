import axios from "axios";

import nodemailer from "nodemailer";
import { disposableApiKey, smtpPassword, smtpUsername } from "../secret.js";
import { errorResponse } from "./responseHandler.js";

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




// Check Disposable Email Address and email Address is valid or not
const EMAIL_VALIDATION_URL = `https://emailvalidation.abstractapi.com/v1/?api_key=${disposableApiKey}`;

async function validateEmailMiddleware(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, { errorMessage: "Email is required." });
  }

  try {
    // Call the Abstract API to validate the email
    const response = await axios.get(`${EMAIL_VALIDATION_URL}&email=${email}`);

    const data = response?.data;

    // Checks with specific error messages
    if (data.deliverability !== "DELIVERABLE") {
      return errorResponse(res, { errorMessage: "Email is not deliverable." });
    }
    if (!data.is_valid_format.value) {
      return errorResponse(res, { errorMessage: "Email format is invalid." });
    }
    if (data.is_disposable_email.value) {
      return errorResponse(res, {
        errorMessage: "Disposable email addresses are not allowed."
      });
    }
    if (!data.is_mx_found.value) {
      return errorResponse(res, {
        errorMessage: "Email domain does not have valid MX records."
      });
    }
    if (!data.is_smtp_valid.value) {
      return errorResponse(res, {
        errorMessage: "Email address is not valid on SMTP server."
      });
    }

    next();
  } catch (error) {
    console.error("Error during email validation:", error.message);
    return errorResponse(res, {
      statusCode: 500,
      errorMessage: "Email validation failed. Please try again."
    });
  }
}

export { sendEmailWithNodemailer, validateEmailMiddleware };
