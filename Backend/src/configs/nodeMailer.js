import "../configs/env.js"; 
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",
    host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP VERIFY ERROR:", err);
  } else {
    console.log("✅ SMTP READY TO SEND EMAILS");
  }
});

export default transporter;



