import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subject, messageBody, recipients } = req.body;

  try {
    const sendPromises = recipients.map((user: any) => {
      // The Template Logic
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #09090b; padding: 32px; text-align: center;">
            <div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 8px; display: inline-block; line-height: 40px; color: white; font-weight: 900; font-size: 20px;">M</div>
            <h1 style="color: white; margin-top: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">MifimnPay</h1>
          </div>
          <div style="padding: 40px; color: #18181b; line-height: 1.6;">
            <h2 style="font-size: 18px; margin-bottom: 20px;">Hello ${user.business_name},</h2>
            <div style="color: #52525b;">${messageBody.replace(/\n/g, '<br/>')}</div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #a1a1aa;">
            Sent to ${user.auth_email} • <a href="https://mifimnpay.com.ng">Unsubscribe</a>
          </div>
        </div>
      `;

      return resend.emails.send({
        from: 'MifimnPay <info@mifimnpay.com.ng>',
        to: user.auth_email,
        reply_to: 'shittumifimn0807@gmail.com', // Your personal Gmail
        subject: subject,
        html: htmlContent,
      });
    });

    await Promise.all(sendPromises);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}