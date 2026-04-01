// app/api/notify-vendor-verified/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, businessName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const dashboardLink = `https://mifimnpay.com.ng/dashboard`;

    const { data, error } = await resend.emails.send({
      from: 'MifimnPay Support <support@mifimnpay.com.ng>', // Ensure this matches your verified Resend domain
      to: email,
      subject: '🎉 Congratulations! Your MifimnPay Storefront is Verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="background-color: #22c55e; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; font-size: 30px; display: inline-block;">✓</div>
          </div>
          <h2 style="color: #22c55e; font-style: italic; text-transform: uppercase; text-align: center;">Storefront Unlocked!</h2>
          <p>Hello <strong>${businessName || 'Vendor'}</strong>,</p>
          <p>Great news! Your Identity Verification (NIN) has been successfully reviewed and approved by the MifimnPay Admin team.</p>
          <p><strong>Your account is now fully upgraded:</strong></p>
          <ul style="background-color: #f8fafc; padding: 15px 15px 15px 35px; border-radius: 8px;">
            <li>The 10-receipt creation limit has been removed.</li>
            <li>Your Digital Storefront and QR Code are now fully active.</li>
            <li>Customers can now visit your personalized store link to place orders.</li>
          </ul>
          <p>Click below to access your unlocked dashboard and start managing your products:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="background-color: #f97316; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              Go to Dashboard
            </a>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">Welcome to the MifimnPay family!</p>
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