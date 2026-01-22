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
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        :root { color-scheme: light; }
        /* Gmail iOS blend mode fix */
        u + .body .gm-screen { background: #000; mix-blend-mode: screen; }
        u + .body .gm-diff { background: #000; mix-blend-mode: difference; }
        /* Apple Mail & supported clients */
        @media (prefers-color-scheme: dark) {
          .dark-footer { background-color: #000000 !important; }
          .dark-footer td { background-color: #000000 !important; }
        }
        /* Gmail/Outlook mobile */
        [data-ogsc] .footer-text { color: #888888 !important; }
        [data-ogsb] .dark-footer { background-color: #000000 !important; }
      </style>
    </head>
    <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-bible-header.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/woman-in-van-animated.gif" alt="Woman reading Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">Welcome to Vagabond Bible</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Vagabond Bible brings Scripture to life with AI-powered insights, historical context, and a 24/7 pastor ready to guide you through God's Word, wherever you are.
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; mso-padding-alt: 0; line-height: 1;">
            Start Exploring
          </a>
        </div>
        
        <!-- Footer - uses linear-gradient which Gmail doesn't invert -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-footer" style="background-color: #000000; background-image: linear-gradient(#000000, #000000);" bgcolor="#000000">
          <tr>
            <td align="center" style="background-color: #000000; background-image: linear-gradient(#000000, #000000); padding: 24px;" bgcolor="#000000">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto; min-height: 54px;">
              </a>
              <p class="footer-text" style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <span class="gm-screen"><span class="gm-diff">
                  <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                  <span style="color: #555555; margin: 0 8px;">•</span>
                  <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
                </span></span>
              </p>
            </td>
          </tr>
        </table>
        
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
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        :root { color-scheme: light; }
        /* Gmail iOS blend mode fix */
        u + .body .gm-screen { background: #000; mix-blend-mode: screen; }
        u + .body .gm-diff { background: #000; mix-blend-mode: difference; }
        /* Apple Mail & supported clients */
        @media (prefers-color-scheme: dark) {
          .dark-footer { background-color: #000000 !important; }
          .dark-footer td { background-color: #000000 !important; }
        }
        /* Gmail/Outlook mobile */
        [data-ogsc] .footer-text { color: #888888 !important; }
        [data-ogsb] .dark-footer { background-color: #000000 !important; }
      </style>
    </head>
    <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-bible-header.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/moses-pro-animated.gif" alt="Moses parting the sea" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">You're Pro Now</h1>
          
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
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; mso-padding-alt: 0; line-height: 1;">
            Open Vagabond Bible
          </a>
        </div>
        
        <!-- Footer - uses linear-gradient which Gmail doesn't invert -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-footer" style="background-color: #000000; background-image: linear-gradient(#000000, #000000);" bgcolor="#000000">
          <tr>
            <td align="center" style="background-color: #000000; background-image: linear-gradient(#000000, #000000); padding: 24px;" bgcolor="#000000">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto; min-height: 54px;">
              </a>
              <p class="footer-text" style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <span class="gm-screen"><span class="gm-diff">
                  <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                  <span style="color: #555555; margin: 0 8px;">•</span>
                  <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
                </span></span>
              </p>
            </td>
          </tr>
        </table>
        
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

// Ambassador Email Templates

export function getAmbassadorApplicationEmailHtml(displayName: string): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        :root { color-scheme: light; }
        u + .body .gm-screen { background: #000; mix-blend-mode: screen; }
        u + .body .gm-diff { background: #000; mix-blend-mode: difference; }
        @media (prefers-color-scheme: dark) {
          .dark-footer { background-color: #000000 !important; }
          .dark-footer td { background-color: #000000 !important; }
        }
        [data-ogsc] .footer-text { color: #888888 !important; }
        [data-ogsb] .dark-footer { background-color: #000000 !important; }
      </style>
    </head>
    <body class="body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Ambassador Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block; min-height: 54px;">
        </div>
        
        <!-- Hero Image - Different from Approved email -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/ambassador-applied-hero.png" alt="Ambassador Application" style="width: 100%; height: auto; display: block; min-height: 54px;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">Application Received!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Thank you for applying to become a Vagabond Bible Ambassador, ${displayName}. We're excited to review your application!
          </p>
          
          <!-- What Happens Next Section - Stacked Cards -->
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">What Happens Next</h2>
          
          <!-- Card 1: Review -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">📋</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Review</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">We'll review your application within 24-48 hours</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Card 2: Notification -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">📧</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Notification</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">You'll receive an email with our decision</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Card 3: Get Started -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">🚀</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Get Started</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">If approved, you'll get instant access to your dashboard</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Note about limited spots -->
          <p style="font-size: 14px; line-height: 1.5; color: #666; margin: 0 0 30px 0; font-style: italic;">
            Ambassador spots are limited to ensure quality support for each member. Either way, we'll be in touch soon!
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; mso-padding-alt: 0; line-height: 1;">
            Explore Vagabond Bible
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-footer" style="background-color: #000000; background-image: linear-gradient(#000000, #000000);" bgcolor="#000000">
          <tr>
            <td align="center" style="background-color: #000000; background-image: linear-gradient(#000000, #000000); padding: 24px;" bgcolor="#000000">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto; min-height: 54px;">
              </a>
              <p class="footer-text" style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <span class="gm-screen"><span class="gm-diff">
                  <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                  <span style="color: #555555; margin: 0 8px;">•</span>
                  <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
                </span></span>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

export async function sendAmbassadorApplicationEmail(userEmail: string, firstName?: string | null) {
  console.log(`[Email] Sending ambassador application email to ${userEmail}...`);
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    const displayName = firstName || 'Friend';
    
    const result = await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Application Received, ${displayName}!`,
      html: getAmbassadorApplicationEmailHtml(displayName)
    });
    
    console.log('[Email] Ambassador application email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending ambassador application email:', error);
    throw error;
  }
}

export function getAmbassadorApprovedEmailHtml(displayName: string, referralCode: string): string {
  const referralLink = `${BASE_URL}/?ref=${referralCode}`;
  const teamInviteLink = `${BASE_URL}/ambassador/apply?invite=${referralCode}`;
  
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light only">
      <style>
        :root { color-scheme: light only; supported-color-schemes: light only; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;" bgcolor="#ffffff">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;" bgcolor="#ffffff">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;" bgcolor="#ffffff">
              <tr>
                <td>
                  <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block;">
                </td>
              </tr>
              <tr>
                <td>
                  <img src="${BASE_URL}/email-assets/ambassador-hero.png" alt="Ambassador" style="width: 100%; height: auto; display: block;">
                </td>
              </tr>
              <tr>
                <td style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;" bgcolor="#FAF9F6">
              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">You're Approved!</h1>
              <p style="color: #C99A2E; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">Welcome to the Team, ${displayName}</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
                You're now a Vagabond Bible Ambassador. Share your unique link with friends and family, and earn rewards when they subscribe to Pro.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF8E7; border-radius: 12px; border-left: 4px solid #C99A2E; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 16px 20px; text-align: left;">
                    <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
                      <strong>Pro Tip:</strong> You earn more commission if people sign up through web instead of app. So encourage them to sign up on the vagabondbible.com site!
                    </p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 24px; text-align: left;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Your Referral Link</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; border-radius: 8px;">
                      <tr>
                        <td style="padding: 12px 16px;">
                          <a href="${referralLink}" style="font-family: monospace; font-size: 14px; color: #C99A2E; text-decoration: none; word-break: break-all;">${referralLink}</a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 12px; color: #666; margin: 8px 0 0 0;">Tap to open or copy and share with others</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 30px 0 20px 0;">How It Works</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; margin: 0 0 12px 0;">
                <tr>
                  <td style="padding: 20px; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: top; font-size: 24px;">1.</td>
                        <td style="vertical-align: top;">
                          <p style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0;">Share Your Link</p>
                          <p style="font-size: 13px; color: #666; margin: 4px 0 0 0;">Send to friends, family, and community</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; margin: 0 0 12px 0;">
                <tr>
                  <td style="padding: 20px; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: top; font-size: 24px;">2.</td>
                        <td style="vertical-align: top;">
                          <p style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0;">They Sign Up</p>
                          <p style="font-size: 13px; color: #666; margin: 4px 0 0 0;">Free or Pro, you get credit</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 20px; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: top; font-size: 24px;">3.</td>
                        <td style="vertical-align: top;">
                          <p style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0;">Earn Rewards</p>
                          <p style="font-size: 13px; color: #666; margin: 4px 0 0 0;">Get paid for Pro conversions</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Access Your Dashboard</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 20px; text-align: left;">
                    <p style="font-size: 15px; color: #333; margin: 0 0 12px 0;"><span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">1</span> Open the App or Site</p>
                    <p style="font-size: 15px; color: #333; margin: 0 0 12px 0;"><span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">2</span> Go to the Menu</p>
                    <p style="font-size: 15px; color: #333; margin: 0 0 12px 0;"><span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">3</span> Tap "Ambassadors"</p>
                    <p style="font-size: 15px; color: #333; margin: 0;"><span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">4</span> Copy your referral link and share it!</p>
                  </td>
                </tr>
              </table>
          
          <a href="${BASE_URL}/ambassador" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center;">
            Open Your Dashboard
          </a>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #1a1a1a; padding: 24px;" bgcolor="#1a1a1a">
                  <a href="https://thetravelingchurch.com" style="display: inline-block;">
                    <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
                  </a>
                  <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                    <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                    <span style="color: #555555; margin: 0 8px;">&#8226;</span>
                    <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">Donate</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendAmbassadorApprovedEmail(
  userEmail: string, 
  firstName: string | null | undefined, 
  referralCode: string
) {
  console.log(`[Email] Sending ambassador approved email to ${userEmail}...`);
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    const displayName = firstName || 'Ambassador';
    
    const result = await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `You're Approved, ${displayName}! Welcome to the Team`,
      html: getAmbassadorApprovedEmailHtml(displayName, referralCode)
    });
    
    console.log('[Email] Ambassador approved email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending ambassador approved email:', error);
    throw error;
  }
}

// Admin notification email when someone applies
export function getAmbassadorAdminNotificationEmailHtml(
  applicantName: string,
  applicantEmail: string,
  applicantId: string,
  applicationDetails: { country?: string; reason?: string; referralSource?: string }
): string {
  const approveUrl = `${BASE_URL}/admin?highlight=${applicantId}`;
  const viewUrl = `${BASE_URL}/admin?highlight=${applicantId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #C99A2E; font-size: 24px; margin: 0; font-family: Georgia, 'Times New Roman', serif;">New Ambassador Application</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin: 0 0 24px 0;">
            <strong>${applicantName}</strong> has applied to become a Vagabond Bible Ambassador.
          </p>
          
          <!-- Applicant Details -->
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px 0;">Applicant Details</h2>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${applicantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${applicantEmail}</td>
              </tr>
              ${applicationDetails.country ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Country:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${applicationDetails.country}</td>
              </tr>
              ` : ''}
              ${applicationDetails.referralSource ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Source:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${applicationDetails.referralSource}</td>
              </tr>
              ` : ''}
            </table>
            
            ${applicationDetails.reason ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">Why they want to be an ambassador:</p>
              <p style="font-size: 14px; color: #333; margin: 0; font-style: italic;">"${applicationDetails.reason}"</p>
            </div>
            ` : ''}
          </div>
          
          <!-- Action Buttons - Stacked for Mobile -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding-bottom: 12px;">
                <a href="${approveUrl}" 
                   style="background-color: #22c55e; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: 600; display: block; font-size: 16px; width: 100%; max-width: 280px; text-align: center; box-sizing: border-box;">
                  ✓ Approve
                </a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="mailto:${applicantEmail}?subject=Your%20Vagabond%20Bible%20Ambassador%20Application" 
                   style="background-color: #3b82f6; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: 600; display: block; font-size: 16px; width: 100%; max-width: 280px; text-align: center; box-sizing: border-box;">
                  ✉️ Message
                </a>
              </td>
            </tr>
          </table>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${viewUrl}" style="color: #666; font-size: 14px; text-decoration: underline;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 16px; text-align: center; border-top: 1px solid #e5e5e5;">
          <p style="font-size: 12px; color: #888; margin: 0;">
            Vagabond Bible Ambassador Program
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function sendAmbassadorAdminNotificationEmail(
  applicantName: string,
  applicantEmail: string,
  applicantId: string,
  applicationDetails: { country?: string; reason?: string; referralSource?: string } = {}
) {
  console.log(`[Email] Sending admin notification for ambassador application from ${applicantEmail}...`);
  
  try {
    const client = await getResendClient();
    const fromEmail = await getFromEmail();
    
    const result = await client.emails.send({
      from: fromEmail,
      to: 'pastorbrett@thetravelingchurch.com',
      subject: `New Ambassador Application: ${applicantName}`,
      html: getAmbassadorAdminNotificationEmailHtml(applicantName, applicantEmail, applicantId, applicationDetails),
      replyTo: applicantEmail
    });
    
    console.log('[Email] Admin notification email sent:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[Email] Error sending admin notification email:', error);
    throw error;
  }
}
