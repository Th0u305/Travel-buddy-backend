/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env.ts";
import { Buffer } from "node:buffer";

const transporter = nodemailer.createTransport({
  port: Number(envVars.MAIL_SMTP_PORT),
  secure: false,
  service: envVars.MAIL_SMTP_HOST,
  auth: {
    user: envVars.MAIL_SMTP_USER,
    pass: envVars.MAIL_SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  // deno-lint-ignore no-explicit-any
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const html = `<h1>Hello!</h1><p>Your OTP is: ${templateData?.otp} </p>
            <p> This code is only valid for 2 minute </p>`;

    await transporter.sendMail({
      from: envVars.MAIL_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

  // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    console.log(error);
  }
};
