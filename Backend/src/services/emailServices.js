import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import transporter  from "../configs/nodeMailer.js"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadTemplate = (filename) => {
  const filePath = path.join(__dirname, "../templates", filename);
  return fs.readFileSync(filePath, "utf-8");
};



export const sendOtpEmail = async (email, otp) => {

  let template = loadTemplate("email.html");

  template = template.replace("{{OTP}}", otp);

  await transporter.sendMail({
    to: email,
    subject: "Your Blue Ledger Login Code",
    html: template,
    attachments: [
    {
      filename: "logo.png",
      path: path.join(__dirname, "../templates/logo.png"),
      cid: "logo"
    }
  ]
  });
};

export const sendWelcomEmail = async(email,name) =>{
    let template = loadTemplate("welcom.html");

    template = template.replace("{{name}}", name);

    await transporter.sendMail({
        to: email,
        subject: "Welcome to Blue Ledger",
        html: template
    });
}
