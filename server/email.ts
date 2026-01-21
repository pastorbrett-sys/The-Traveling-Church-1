// Resend email service - using Replit Resend integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getResendClient() {
  const { apiKey } = await getCredentials();
  return new Resend(apiKey);
}

async function getFromEmail(): Promise<string> {
  const { fromEmail } = await getCredentials();
  return fromEmail || 'The Traveling Church <onboarding@resend.dev>';
}

export async function sendContactEmail(name: string, email: string, message: string) {
  console.log('[Email] Starting to send contact email...');
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    console.log('[Email] Got Resend client');
    
    const result = await client.emails.send({
      from: fromEmail,
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

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vagabondbible.com' 
  : 'https://vagabondbible.com';

export function getWelcomeEmailHtml(displayName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-bible-logo.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/woman-in-van.png" alt="Woman reading Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif;">Welcome to Vagabond Bible</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Vagabond Bible brings Scripture to life with AI-powered insights, historical context, and a 24/7 pastor ready to guide you through God's Word—wherever you are.
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #D4A84B; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; mso-padding-alt: 0; line-height: 1;">
            Start Exploring
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 24px; width: auto;">
          <p style="color: #888; font-size: 12px; margin: 16px 0 0 0;">
            <a href="${BASE_URL}" style="color: #888; text-decoration: none;">vagabondbible.com</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function sendWelcomeEmail(userEmail: string, firstName?: string | null) {
  console.log(`[Email] Sending welcome email to ${userEmail}...`);
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    const displayName = firstName || 'Friend';
    
    const result = await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Welcome to Vagabond Bible, ${displayName}!`,
      html: getWelcomeEmailHtml(displayName)
    });
    
    console.log('[Email] Welcome email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending welcome email:', error);
    throw error;
  }
}

export function getSubscriptionEmailHtml(displayName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-bible-logo.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/woman-in-van.png" alt="Woman reading Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif;">You're Pro Now</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 24px 0;">
            Thank you for supporting the mission. You now have unlimited access to:
          </p>
          
          <div style="text-align: left; display: inline-block; margin: 0 0 24px 0;">
            <p style="font-size: 16px; line-height: 2; color: #333; margin: 0;">
              ✓ Unlimited Smart Searches<br>
              ✓ Unlimited Book Synopses<br>
              ✓ Unlimited Verse Insights<br>
              ✓ Unlimited Notes
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Your subscription helps us share God's Word across the globe.
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #D4A84B; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; mso-padding-alt: 0; line-height: 1;">
            Open Vagabond Bible
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 24px; width: auto;">
          <p style="color: #888; font-size: 12px; margin: 16px 0 0 0;">
            <a href="${BASE_URL}/profile" style="color: #888; text-decoration: none;">Manage Subscription</a> · 
            <a href="${BASE_URL}" style="color: #888; text-decoration: none;">vagabondbible.com</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function sendSubscriptionConfirmationEmail(
  userEmail: string, 
  firstName?: string | null,
  planType: 'premium' | 'emerging' = 'premium'
) {
  console.log(`[Email] Sending subscription confirmation to ${userEmail}...`);
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    const displayName = firstName || 'Friend';
    
    const result = await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `You're Pro Now, ${displayName}!`,
      html: getSubscriptionEmailHtml(displayName)
    });
    
    console.log('[Email] Subscription confirmation email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending subscription confirmation email:', error);
    throw error;
  }
}
