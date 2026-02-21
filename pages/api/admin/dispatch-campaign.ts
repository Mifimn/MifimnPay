import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, messageBody, recipients, flyerUrl } = req.body;

  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ error: 'No recipients selected' });
  }

  try {
    // We use Resend Batching for better performance
    const emailBatch = recipients.map((user: any) => {
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #09090b; padding: 32px; text-align: center;">
            <div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 8px; display: inline-block; line-height: 40px; color: white; font-weight: 900; font-size: 20px; text-align: center;">M</div>
            <h1 style="color: white; margin-top: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">MifimnPay</h1>
          </div>

          ${flyerUrl ? `<div style="width: 100%;"><img src="${flyerUrl}" style="width: 100%; display: block;" alt="Campaign Flyer" /></div>` : ''}

          <div style="padding: 40px; color: #18181b; line-height: 1.6;">
            <h2 style="font-size: 18px; margin-bottom: 20px; font-weight: 900;">Hello ${user.business_name},</h2>
            <div style="color: #52525b; font-size: 15px;">${messageBody.replace(/\n/g, '<br/>')}</div>
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f4f4f5; text-align: center;">
              <a href="https://mifimnpay.com.ng/dashboard" style="background-color: #22c55e; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">Go to Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 11px; color: #a1a1aa;">
            Sent via MifimnPay Intelligence Hub<br/>
            &copy; 2026 MifimnPay Services. All rights reserved.
          </div>
        </div>
      `;

      return {
        from: 'MifimnPay <info@mifimnpay.com.ng>',
        to: user.auth_email,
        reply_to: 'shittumifimn0807@gmail.com',
        subject: subject,
        html: htmlContent,
      };
    });

    const { data, error } = await resend.batch.send(emailBatch);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}