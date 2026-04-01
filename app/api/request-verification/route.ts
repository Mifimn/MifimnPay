import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Make sure to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, businessName, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and Token are required' }, { status: 400 });
    }

    // Attach the secure token to the URL
    const verifyLink = `https://mifimnpay.com.ng/verify?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'MifimnPay Security <security@mifimnpay.com.ng>', 
      to: email,
      subject: 'Action Required: Verify Your MifimnPay Business Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f97316; font-style: italic; text-transform: uppercase;">Identity Verification</h2>
          <p>Hello <strong>${businessName || 'Vendor'}</strong>,</p>
          <p>To activate your Storefront and remove the 10-receipt limit, we need to verify your National Identity Number (NIN).</p>
          <p>Please click the secure button below to submit your details for review. <strong>This link is unique to your account.</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              Verify Account Now
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}