import { useState } from "react";

const BASE_URL = window.location.origin;

function getWelcomeEmailHtml(): string {
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
          <img src="${BASE_URL}/email-assets/vagabond-bible-header.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/woman-in-van-animated.gif" alt="Woman reading Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center;">
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
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <a href="https://thetravelingchurch.com" style="display: inline-block;">
            <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
          </a>
          <p style="color: #888; font-size: 12px; margin: 16px 0 0 0;">
            <a href="${BASE_URL}" style="color: #888; text-decoration: none;">vagabondbible.com</a>
            <span style="color: #555; margin: 0 8px;">•</span>
            <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

function getSubscriptionEmailHtml(): string {
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
          <img src="${BASE_URL}/email-assets/vagabond-bible-header.png" alt="Vagabond Bible" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Hero Image -->
        <div style="width: 100%;">
          <img src="${BASE_URL}/email-assets/moses-pro-animated.gif" alt="Moses parting the sea" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 30px 55px; text-align: center;">
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
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <a href="https://thetravelingchurch.com" style="display: inline-block;">
            <img src="${BASE_URL}/email-assets/traveling-church-logo.png" alt="The Traveling Church" style="height: 40px; width: auto;">
          </a>
          <p style="color: #888; font-size: 12px; margin: 16px 0 0 0;">
            <a href="${BASE_URL}" style="color: #888; text-decoration: none;">vagabondbible.com</a>
            <span style="color: #555; margin: 0 8px;">•</span>
            <a href="https://thetravelingchurch.com/programs" style="color: #C99A2E; text-decoration: none;">❤️ Donate</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export default function EmailPreview() {
  const [activeEmail, setActiveEmail] = useState<'welcome' | 'subscription'>('welcome');
  
  const emailHtml = activeEmail === 'welcome' ? getWelcomeEmailHtml() : getSubscriptionEmailHtml();
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Preview</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveEmail('welcome')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeEmail === 'welcome'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="button-preview-welcome"
            >
              Welcome Email
            </button>
            <button
              onClick={() => setActiveEmail('subscription')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeEmail === 'subscription'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="button-preview-subscription"
            >
              Pro Subscription Email
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            Subject: {activeEmail === 'welcome' 
              ? 'Welcome to Vagabond Bible, Friend!' 
              : "You're Pro Now, Friend!"}
          </div>
          <iframe
            srcDoc={emailHtml}
            className="w-full h-[800px] border-0"
            title="Email Preview"
            data-testid="iframe-email-preview"
          />
        </div>
      </div>
    </div>
  );
}
