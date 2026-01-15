import nodemailer from "nodemailer";

const requiredEnvVariables = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "IFTTT_EMAIL",
];

for (const variableName of requiredEnvVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const iftttEmail = process.env.IFTTT_EMAIL;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

await transport.verify();
console.log("SMTP connection OK");

async function sendEmailOnce(subject) {
  const mailOptions = {
    from: `"EB Pilsen" <${gmailUser}>`,
    to: iftttEmail,
    subject,
    text: subject,
  };

  return transport.sendMail(mailOptions);
}

export async function sendTaggedEmail(subject) {
  try {
    await sendEmailOnce(subject);
    return;
  } catch (error) {
    // Simple transient retry: wait 500ms and try once more.
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await sendEmailOnce(subject);
      return;
    } catch (retryError) {
      // Do not log secrets; only log minimal error info.
      console.error("Failed to send email after retry", {
        message: retryError?.message,
        code: retryError?.code,
      });
      throw retryError;
    }
  }
}
