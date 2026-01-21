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
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">Welcome to Vagabond Bible!</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear ${displayName},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for joining our community! I'm Pastor Brett, and I'm thrilled to have you on this journey of faith with us.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            <strong>Here's what you can explore:</strong>
          </p>
          
          <ul style="font-size: 16px; line-height: 1.8; color: #333;">
            <li><strong>AI Bible Buddy</strong> - Chat with Pastor Brett AI for personalized Bible study guidance</li>
            <li><strong>Bible Reader</strong> - Read Scripture in multiple translations</li>
            <li><strong>Smart Search</strong> - Find verses by topic or meaning, not just keywords</li>
            <li><strong>Verse Insights</strong> - Get deeper understanding of any passage</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vagabondbible.com/bible-buddy" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Start Your Bible Study
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            May God bless your journey through His Word!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Grace and Peace,<br>
            <strong>Pastor Brett</strong><br>
            <em>The Traveling Church</em>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            You received this email because you signed up for Vagabond Bible.<br>
            <a href="https://vagabondbible.com" style="color: #2563eb;">Visit vagabondbible.com</a>
          </p>
        </div>
      `
    });
    
    console.log('[Email] Welcome email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending welcome email:', error);
    throw error;
  }
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
    const priceDisplay = planType === 'premium' ? '$7.99/month' : '$1.99/month';
    
    const result = await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Thank You for Becoming a Pro Member, ${displayName}!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">Welcome to Pro!</h1>
            <p style="color: #666; font-size: 18px;">Your subscription is now active</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear ${displayName},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            <strong>Thank you for supporting The Traveling Church ministry!</strong> Your Pro subscription (${priceDisplay}) helps us continue spreading God's Word across the globe.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your Pro Benefits:</h3>
            <ul style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 0;">
              <li><strong>Unlimited AI Bible Buddy chats</strong> - No daily limits</li>
              <li><strong>Priority responses</strong> - Faster AI processing</li>
              <li><strong>Extended conversations</strong> - Longer, deeper discussions</li>
              <li><strong>Support the ministry</strong> - Help us reach more people worldwide</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vagabondbible.com/bible-buddy" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Start Exploring Pro Features
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You can manage your subscription anytime from your account settings.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for being part of our community!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Grace and Peace,<br>
            <strong>Pastor Brett</strong><br>
            <em>The Traveling Church</em>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            You received this email because you subscribed to Vagabond Bible Pro.<br>
            <a href="https://vagabondbible.com/account" style="color: #2563eb;">Manage your subscription</a> | 
            <a href="https://vagabondbible.com" style="color: #2563eb;">Visit vagabondbible.com</a>
          </p>
        </div>
      `
    });
    
    console.log('[Email] Subscription confirmation email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending subscription confirmation email:', error);
    throw error;
  }
}
