// app/api/notify-admin/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { legalName, nin, email } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'MifimnPay Security <security@mifimnpay.com.ng>', // Ensure this matches your verified Resend domain
      to: 'mifimnpay@gmail.com', // YOUR email address
      subject: `🚨 Action Required: New NIN Verification (${legalName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f97316; font-style: italic; text-transform: uppercase;">New Verification Request</h2>
          <p>A merchant has just submitted their NIN details for review.</p>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <p style="margin: 0 0 10px 0;"><strong>Vendor Email:</strong> ${email || 'Not provided'}</p>
            <p style="margin: 0 0 10px 0;"><strong>Legal Full Name:</strong> ${legalName}</p>
            <p style="margin: 0;"><strong>NIN Number:</strong> <span style="font-family: monospace; font-size: 16px; letter-spacing: 2px;">${nin}</span></p>
          </div>

          <p>Please log in to your admin dashboard to approve or reject this request.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mifimnpay.com.ng/admin/users" style="background-color: #22c55e; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              Review Verification
            </a>
          </div>
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