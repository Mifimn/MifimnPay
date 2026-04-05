import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, businessName, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and Token are required' }, { status: 400 });
    }

    const verifyLink = `https://mifimnpay.com.ng/verify?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'MifimnPay Security <security@mifimnpay.com.ng>', 
      to: email,
      subject: 'Action Required: MifimnPay Account Verification',
      // We removed the big buttons and heavy CSS. This looks like a real email to Gmail!
      html: `
        <div style="font-family: sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-w: 600px;">
          <p>Hello ${businessName || 'Vendor'},</p>
          <p>Please verify your MifimnPay vendor account by clicking the secure link below:</p>

          <p><a href="${verifyLink}" style="color: #0284c7; text-decoration: underline;">${verifyLink}</a></p>

          <p>This is required to activate your Storefront and remove receipt limits.</p>
          <br>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #888;">
            If you did not request this verification, please safely ignore this message.<br>
            MifimnPayHQ, Ilorin, Kwara State, Nigeria.
          </p>
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