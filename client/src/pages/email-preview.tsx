import { useState } from "react";

const BASE_URL = window.location.origin;

type EmailType = 'welcome' | 'subscription' | 'donation-receipt' | 'ambassador-applied' | 'ambassador-approved' | 'ambassador-admin';
type Language = 'en' | 'am';

function getWelcomeEmailHtmlAmharic(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
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
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">እንኳን ወደ Vagabond Bible በደህና መጡ</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Vagabond Bible በ AI የተደገፉ ማስተዋወቂያዎች፣ ታሪካዊ አውድ እና 24/7 የሚገኝ ፓስተር በመጽሐፍ ቅዱስ ውስጥ እንዲመሩዎት ዝግጁ ነው፣ በየትኛውም ቦታ ቢሆኑ።
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            ማሰስ ይጀምሩ
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ ይለግሱ</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getSubscriptionEmailHtmlAmharic(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
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
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">አሁን Pro ነዎት</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 24px 0;">
            ተልዕኮውን ስለደገፉ እናመሰግናለን። አሁን ያልተገደበ መዳረሻ አለዎት ወደ፡
          </p>
          
          <div style="text-align: left; display: inline-block; margin: 0 0 24px 0;">
            <p style="font-size: 16px; line-height: 2; color: #333; margin: 0;">
              ✓ ያልተገደበ ብልጥ ፍለጋዎች<br>
              ✓ ያልተገደበ የመጽሐፍ ማጠቃለያዎች<br>
              ✓ ያልተገደበ የጥቅስ ግንዛቤዎች<br>
              ✓ ያልተገደበ ማስታወሻዎች
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            የእርስዎ ምዝገባ የእግዚአብሔርን ቃል በዓለም ዙሪያ እንድናጋራ ይረዳናል።
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Vagabond Bible ይክፈቱ
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ ይለግሱ</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
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
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Start Exploring
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getSubscriptionEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
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
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Open Vagabond Bible
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getAmbassadorAppliedEmailHtmlAmharic(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Ambassador Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/ambassador-applied-hero.png" alt="Ambassador Application" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">ማመልከቻዎ ደርሷል!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            የ Vagabond Bible አምባሳደር ለመሆን ስለአመለከቱ እናመሰግናለን፣ ሳራ። ማመልከቻዎን ለመገምገም ጓጉተናል!
          </p>
          
          <!-- What Happens Next Section -->
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">ቀጣይ ምን ይሆናል</h2>
          
          <!-- Card 1: Review -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">📋</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ግምገማ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ማመልከቻዎን በ24-48 ሰዓታት ውስጥ እንገመግማለን</div>
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
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ማሳወቂያ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ውሳኔያችንን በኢሜይል ይቀበላሉ</div>
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
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ይጀምሩ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ከተፈቀደልዎ፣ ወዲያውኑ ወደ ዳሽቦርድዎ መዳረሻ ያገኛሉ</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Note about limited spots -->
          <p style="font-size: 14px; line-height: 1.5; color: #666; margin: 0 0 30px 0; font-style: italic;">
            ለእያንዳንዱ አባል ጥራት ያለው ድጋፍ ለማረጋገጥ የአምባሳደር ቦታዎች ውስን ናቸው። ምንም ይሁን ምን፣ በቅርቡ እናገኝዎታለን!
          </p>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Vagabond Bible ያስሱ
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ ይለግሱ</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getAmbassadorAppliedEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Ambassador Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image - Different from Approved email -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/ambassador-applied-hero.png" alt="Ambassador Application" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">Application Received!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            Thank you for applying to become a Vagabond Bible Ambassador, Sarah. We're excited to review your application!
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
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Explore Vagabond Bible
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getAmbassadorApprovedEmailHtmlAmharic(): string {
  const referralLink = `${BASE_URL}/?ref=SARAH2025`;
  
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Ambassador Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/ambassador-hero.png" alt="Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">ተቀባይነት አግኝተዋል!</h1>
          <p style="color: #C99A2E; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">ወደ ቡድኑ እንኳን በደህና መጡ፣ ሳራ</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            አሁን የ Vagabond Bible አምባሳደር ነዎት። ልዩ ማገናኛዎን ከጓደኞችና ከቤተሰብ ጋር ያጋሩ፣ Pro ሲመዘገቡ ሽልማቶችን ያግኙ።
          </p>
          
          <!-- Pro Tip -->
          <div style="background-color: #FFF8E7; border-radius: 12px; padding: 16px 20px; margin: 0 0 24px 0; text-align: left; border-left: 4px solid #C99A2E;">
            <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
              <strong>ጠቃሚ ምክር:</strong> ሰዎች በድር ጣቢያ ከመተግበሪያ ይልቅ ሲመዘገቡ ብዙ ኮሚሽን ያገኛሉ። ስለዚህ በ vagabondbible.com ጣቢያ እንዲመዘገቡ ያበረታቷቸው!
            </p>
          </div>
          
          <!-- Your Referral Link -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🔗 የእርስዎ ማጣቀሻ ማገናኛ</h2>
            <div style="background-color: #f5f5f5; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 14px; color: #333; word-break: break-all;">
              ${referralLink}
            </div>
          </div>
          
          <!-- How It Works -->
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">እንዴት ይሰራል</h2>
          
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;"><span style="font-size: 24px;">🔗</span></td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ማገናኛዎን ያጋሩ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ለጓደኞች፣ ለቤተሰብና ለማህበረሰብ ይላኩ</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;"><span style="font-size: 24px;">👥</span></td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ይመዘገባሉ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ነፃ ወይም Pro፣ ክሬዲት ያገኛሉ</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;"><span style="font-size: 24px;">💰</span></td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">ሽልማቶችን ያግኙ</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">ለ Pro ልወጣዎች ክፍያ ያግኙ</div>
                </td>
              </tr>
            </table>
          </div>
          
          <a href="${BASE_URL}/ambassador" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            ዳሽቦርድዎን ይክፈቱ
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ ይለግሱ</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getAmbassadorApprovedEmailHtml(): string {
  const referralLink = `${BASE_URL}/?ref=SARAH2025`;
  
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with Ambassador Logo -->
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/vagabond-ambassador-header.png" alt="Vagabond Bible Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/ambassador-hero.png" alt="Ambassador" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -0.5px;">You're Approved!</h1>
          <p style="color: #C99A2E; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">Welcome to the Team, Sarah</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
            You're now a Vagabond Bible Ambassador. Share your unique link with friends and family, and earn rewards when they subscribe to Pro.
          </p>
          
          <!-- Pro Tip - Above referral link -->
          <div style="background-color: #FFF8E7; border-radius: 12px; padding: 16px 20px; margin: 0 0 24px 0; text-align: left; border-left: 4px solid #C99A2E;">
            <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
              <strong>💡 Pro Tip:</strong> You earn more commission if people sign up through web instead of app. So encourage them to sign up on the vagabondbible.com site!
            </p>
          </div>
          
          <!-- Your Referral Link -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🔗 Your Referral Link</h2>
            <div style="background-color: #f5f5f5; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 14px; color: #333; word-break: break-all;">
              ${referralLink}
            </div>
          </div>
          
          <!-- How It Works - Individual Stacked Cards -->
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">How It Works</h2>
          
          <!-- Card 1: Share Your Link -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">🔗</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Share Your Link</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">Send to friends, family, and community</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Card 2: They Sign Up -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 12px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">👥</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">They Sign Up</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">Free or Pro, you get credit</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Card 3: Earn Rewards -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <span style="font-size: 24px;">💰</span>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 600; color: #1a1a1a;">Earn Rewards</div>
                  <div style="font-size: 13px; color: #666; margin-top: 4px;">Get paid for Pro conversions</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Access Your Dashboard - Simple Steps -->
          <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Access Your Dashboard</h2>
          
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 0 0 30px 0; text-align: left; border: 1px solid #e5e5e5;">
            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">1</span>
              <span style="font-size: 15px; color: #333;">Open the App or Site</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">2</span>
              <span style="font-size: 15px; color: #333;">Go to the Menu</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">3</span>
              <span style="font-size: 15px; color: #333;">Tap "Ambassadors"</span>
            </div>
            
            <div>
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #C99A2E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; margin-right: 12px;">4</span>
              <span style="font-size: 15px; color: #333;">Copy your referral link and share it!</span>
            </div>
          </div>
          
          <a href="${BASE_URL}/vagabond-bible" 
             style="background-color: #C99A2E; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 16px; text-align: center; line-height: 1;">
            Open Your Dashboard
          </a>
        </div>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000 !important;">
          <tr>
            <td align="center" bgcolor="#000000" style="background-color: #000000 !important; padding: 24px;">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
              </a>
              <p style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <a href="${BASE_URL}" style="color: #888888; text-decoration: none;">vagabondbible.com</a>
                <span style="color: #555555; margin: 0 8px;">•</span>
                <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
              </p>
            </td>
          </tr>
        </table>
        
      </div>
    </body>
    </html>
  `;
}

function getAmbassadorAdminEmailHtml(): string {
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
            <strong>Tadesse Bekele</strong> has applied to become a Vagabond Bible Ambassador.
          </p>
          
          <!-- Applicant Details -->
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px 0;">Applicant Details</h2>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">Tadesse Bekele</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">tadesse@example.com</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Country:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">Ethiopia</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Source:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">Tour Guide</td>
              </tr>
            </table>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">Why they want to be an ambassador:</p>
              <p style="font-size: 14px; color: #333; margin: 0; font-style: italic;">"I lead tours for Christian travelers in Ethiopia and want to share Vagabond Bible with my guests to help them connect with the biblical history of our country."</p>
            </div>
          </div>
          
          <!-- Action Buttons - Stacked for Mobile -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding-bottom: 12px;">
                <a href="${BASE_URL}/admin?highlight=123" 
                   style="background-color: #22c55e; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: 600; display: block; font-size: 16px; width: 100%; max-width: 280px; text-align: center; box-sizing: border-box;">
                  ✓ Approve
                </a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="mailto:tadesse@example.com?subject=Your%20Vagabond%20Bible%20Ambassador%20Application" 
                   style="background-color: #3b82f6; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: 600; display: block; font-size: 16px; width: 100%; max-width: 280px; text-align: center; box-sizing: border-box;">
                  ✉️ Message
                </a>
              </td>
            </tr>
          </table>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${BASE_URL}/admin?highlight=123" style="color: #666; font-size: 14px; text-decoration: underline;">
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

function getDonationReceiptPreviewHtml(): string {
  const donationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
        
        <div style="text-align: center;">
          <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 60px; width: auto; margin: 30px auto; display: block;">
        </div>
        
        <div style="padding: 10px 30px 50px; background-color: #FAF9F6;">
          <h1 style="color: #1a1a1a; font-size: 26px; font-weight: bold; margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
            Thank You for Your Gift
          </h1>
          <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 28px 0; text-align: center;">
            Your generosity supports The Traveling Church's mission worldwide.
          </p>

          <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
            <h2 style="color: #1a1a1a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
              Donation Receipt
            </h2>
            <table style="width: 100%; font-size: 15px; color: #333;" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 8px 0; color: #888;">Organization</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">The Traveling Church</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">EIN</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">41-3093491</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Date</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${donationDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Amount</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #C99A2E; font-size: 18px;">$100.00</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Type</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">One-Time</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Note</td>
                <td style="padding: 8px 0; text-align: right; font-style: italic;">For the Ethiopia mission trip</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f8f6f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; border-left: 4px solid #C99A2E;">
            <p style="font-size: 13px; line-height: 1.7; color: #555; margin: 0;">
              <strong style="color: #333;">Tax-Deductibility Statement:</strong><br>
              The Traveling Church is a registered 501(c)(3) nonprofit organization (EIN: 41-3093491). 
              No goods or services were provided in exchange for this contribution. 
              This letter serves as your official receipt for tax purposes. 
              Please retain this receipt for your tax records.
            </p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #555; text-align: center; margin: 0 0 24px 0;">
            Your one-time gift makes a real difference. Thank you for standing with us.
          </p>

          <div style="text-align: center;">
            <a href="https://thetravelingchurch.com/programs" 
               style="background-color: #C99A2E; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; font-size: 15px;">
              See Our Programs
            </a>
          </div>
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-footer" style="background-color: #000000; background-image: linear-gradient(#000000, #000000);" bgcolor="#000000">
          <tr>
            <td align="center" style="background-color: #000000; background-image: linear-gradient(#000000, #000000); padding: 24px;" bgcolor="#000000">
              <a href="https://thetravelingchurch.com" style="display: inline-block;">
                <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto; min-height: 54px;">
              </a>
              <p class="footer-text" style="color: #888888; font-size: 12px; margin: 16px 0 0 0;">
                <span class="gm-screen"><span class="gm-diff">
                  <a href="https://thetravelingchurch.com" style="color: #888888; text-decoration: none;">thetravelingchurch.com</a>
                  <span style="color: #555555; margin: 0 8px;">•</span>
                  EIN: 41-3093491
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

const emailConfig: Record<EmailType, { 
  title: string; 
  subject: Record<Language, string>; 
  getHtml: Record<Language, () => string>;
  hasAmharic: boolean;
}> = {
  'donation-receipt': {
    title: 'Donation Receipt',
    subject: {
      en: 'Donation Receipt — $100.00 | The Traveling Church',
      am: 'Donation Receipt — $100.00 | The Traveling Church'
    },
    getHtml: {
      en: getDonationReceiptPreviewHtml,
      am: getDonationReceiptPreviewHtml
    },
    hasAmharic: false
  },
  'welcome': {
    title: 'Welcome Email',
    subject: {
      en: 'Welcome to Vagabond Bible, Friend!',
      am: 'እንኳን ወደ Vagabond Bible በደህና መጡ፣ ወዳጅ!'
    },
    getHtml: {
      en: getWelcomeEmailHtml,
      am: getWelcomeEmailHtmlAmharic
    },
    hasAmharic: true
  },
  'subscription': {
    title: 'Pro Subscription',
    subject: {
      en: "You're Pro Now, Friend!",
      am: 'አሁን Pro ነዎት፣ ወዳጅ!'
    },
    getHtml: {
      en: getSubscriptionEmailHtml,
      am: getSubscriptionEmailHtmlAmharic
    },
    hasAmharic: true
  },
  'ambassador-applied': {
    title: 'Ambassador Applied',
    subject: {
      en: 'Application Received, Sarah!',
      am: 'ማመልከቻዎ ደርሷል፣ ሳራ!'
    },
    getHtml: {
      en: getAmbassadorAppliedEmailHtml,
      am: getAmbassadorAppliedEmailHtmlAmharic
    },
    hasAmharic: true
  },
  'ambassador-approved': {
    title: 'Ambassador Approved',
    subject: {
      en: "You're Approved, Sarah! Welcome to the Team",
      am: "ተቀባይነት አግኝተዋል፣ ሳራ! ወደ ቡድኑ እንኳን በደህና መጡ"
    },
    getHtml: {
      en: getAmbassadorApprovedEmailHtml,
      am: getAmbassadorApprovedEmailHtmlAmharic
    },
    hasAmharic: true
  },
  'ambassador-admin': {
    title: 'Admin Notification',
    subject: {
      en: 'New Ambassador Application: Tadesse Bekele',
      am: 'New Ambassador Application: Tadesse Bekele'
    },
    getHtml: {
      en: getAmbassadorAdminEmailHtml,
      am: getAmbassadorAdminEmailHtml
    },
    hasAmharic: false
  }
};

export default function EmailPreview() {
  const [activeEmail, setActiveEmail] = useState<EmailType>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  
  const config = emailConfig[activeEmail];
  const emailHtml = config.getHtml[language]();
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Preview</h1>
          
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">User Emails</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveEmail('welcome')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'welcome'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-welcome"
              >
                Welcome
              </button>
              <button
                onClick={() => setActiveEmail('subscription')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'subscription'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-subscription"
              >
                Pro Subscription
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Donation Emails</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveEmail('donation-receipt')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'donation-receipt'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-donation-receipt"
              >
                Donation Receipt
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Ambassador Emails</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveEmail('ambassador-applied')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'ambassador-applied'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-ambassador-applied"
              >
                Applied (To User)
              </button>
              <button
                onClick={() => setActiveEmail('ambassador-approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'ambassador-approved'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-ambassador-approved"
              >
                Approved (To User)
              </button>
              <button
                onClick={() => setActiveEmail('ambassador-admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeEmail === 'ambassador-admin'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                data-testid="button-preview-ambassador-admin"
              >
                Admin Notification
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center">
            <span>Subject: {config.subject[language]}</span>
            {config.hasAmharic && (
              <div className="flex gap-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    language === 'en' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  data-testid="button-language-en"
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    language === 'am' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  data-testid="button-language-am"
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>
          <iframe
            srcDoc={emailHtml}
            className="w-full h-[900px] border-0"
            title="Email Preview"
            data-testid="iframe-email-preview"
          />
        </div>
      </div>
    </div>
  );
}
