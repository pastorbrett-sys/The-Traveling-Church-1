// Resend email service - using RESEND_API_KEY secret
import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY secret is not set');
  }
  return new Resend(apiKey);
}

export async function sendContactEmail(name: string, email: string, message: string) {
  console.log('[Email] Starting to send contact email...');
  
  try {
    const client = getResendClient();
    // Use Resend's shared domain - no DNS verification required!
    const sharedFromEmail = 'The Traveling Church <onboarding@resend.dev>';
    console.log('[Email] Got Resend client, using shared domain');
    
    const result = await client.emails.send({
      from: sharedFromEmail,
      to: 'pastorbrett@thetravelingchurch.com',
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This message was sent from The Traveling Church website contact form.</p>
      `,
      replyTo: email
    });
    
    console.log('[Email] Send result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    throw error;
  }
}
