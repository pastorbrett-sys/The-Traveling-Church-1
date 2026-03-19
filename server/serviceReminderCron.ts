import cron from 'node-cron';
import { db } from './storage';
import { serviceReminders } from '@shared/schema';

async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings?.settings?.api_key) {
    throw new Error('Resend not connected');
  }

  const { Resend } = await import('resend');
  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email || 'The Traveling Church <onboarding@resend.dev>',
  };
}

const SERVICES = [
  {
    name: 'Bible Study (East)',
    day: 'Thursday',
    hourUTC: 13,
    minuteUTC: 0,
    meetLink: 'https://meet.google.com/mya-phhf-qag',
    dialIn: '+1 424-265-1291 PIN: 106812980',
  },
  {
    name: 'Bible Study (Central)',
    day: 'Thursday',
    hourUTC: 18,
    minuteUTC: 0,
    meetLink: 'https://meet.google.com/yhn-fbgs-ibw',
    dialIn: '+1 502-498-8797 PIN: 615065026',
  },
  {
    name: 'Bible Study (West)',
    day: 'Thursday',
    hourUTC: 17,
    minuteUTC: 0,
    meetLink: 'https://meet.google.com/gmm-skpt-xri',
    dialIn: '+1 720-500-3075 PIN: 158815756',
  },
];

function formatTimeInTimezone(hourUTC: number, minuteUTC: number, timezone: string): string {
  try {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUTC, minuteUTC, 0));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone, timeZoneName: 'short' });
  } catch {
    const d = new Date(Date.UTC(2025, 0, 1, hourUTC, minuteUTC, 0));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC', timeZoneName: 'short' });
  }
}

function buildReminderEmailHtml(timezone: string): string {
  const serviceRows = SERVICES.map(s => {
    const localTime = formatTimeInTimezone(s.hourUTC, s.minuteUTC, timezone);
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #eee;">
          <strong style="color: #1a1a1a;">${s.name}</strong><br>
          <span style="color: #666; font-size: 14px;">Today at ${localTime}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #eee; text-align: right;">
          <a href="${s.meetLink}" style="background-color: #C99A2E; color: #fff; padding: 8px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">Join</a>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 4px 16px 12px; border-bottom: 1px solid #eee;">
          <span style="color: #888; font-size: 12px;">Can't use video? Call: ${s.dialIn}</span>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #fff;">
    <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
      <h1 style="color: #C99A2E; font-size: 22px; margin: 0; font-family: Georgia, serif;">Bible Study Reminder</h1>
      <p style="color: #ccc; font-size: 14px; margin: 8px 0 0;">The Traveling Church</p>
    </div>
    <div style="padding: 24px;">
      <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Today's Bible studies are coming up! Pick the time that works best for you:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        ${serviceRows}
      </table>
      <div style="margin-top: 24px; padding: 16px; background: #f9f9f6; border-radius: 8px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Join the WhatsApp group for updates</p>
        <a href="https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc" style="color: #25D366; font-weight: 600; text-decoration: none; font-size: 14px;">Open WhatsApp Group</a>
      </div>
    </div>
    <div style="background-color: #1a1a1a; padding: 16px; text-align: center;">
      <p style="color: #888; font-size: 11px; margin: 0;">To stop receiving reminders, reply STOP to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWeeklyReminders() {
  console.log('[ServiceReminder] Starting weekly reminder send...');
  try {
    const subscribers = await db.select().from(serviceReminders);
    if (subscribers.length === 0) {
      console.log('[ServiceReminder] No subscribers, skipping.');
      return;
    }

    const { client, fromEmail } = await getResendClient();
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        await client.emails.send({
          from: fromEmail,
          to: sub.email,
          subject: "Bible Study Today — The Traveling Church",
          html: buildReminderEmailHtml(sub.timezone),
        });
        sent++;
      } catch (err) {
        console.error(`[ServiceReminder] Failed to send to ${sub.email}:`, err);
        failed++;
      }
    }

    console.log(`[ServiceReminder] Done. Sent: ${sent}, Failed: ${failed}`);
  } catch (err) {
    console.error('[ServiceReminder] Error in weekly reminder cron:', err);
  }
}

export function initServiceReminderCron() {
  console.log('[ServiceReminder] Initializing Thursday 9 AM UTC cron...');
  cron.schedule('0 9 * * 4', async () => {
    console.log(`[ServiceReminder] Cron fired at ${new Date().toISOString()}`);
    await sendWeeklyReminders();
  }, { timezone: 'UTC' });
  console.log('[ServiceReminder] Cron initialized - runs every Thursday at 9:00 UTC');
}

export async function sendConfirmationEmail(email: string, timezone: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "You're signed up for Bible Study reminders!",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
<div style="max-width:560px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#C99A2E;font-size:22px;margin:0;font-family:Georgia,serif;">You're All Set!</h1>
  </div>
  <div style="padding:24px;">
    <p style="color:#333;font-size:16px;line-height:1.5;">You'll receive a short email every Thursday morning with that day's Bible study times (in your local timezone) and a link to join.</p>
    <p style="color:#333;font-size:16px;line-height:1.5;">In the meantime, join our WhatsApp group to stay connected with the community:</p>
    <div style="text-align:center;margin:20px 0;">
      <a href="https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc" style="background:#25D366;color:#fff;padding:12px 32px;text-decoration:none;border-radius:24px;font-weight:600;font-size:16px;display:inline-block;">Join WhatsApp Group</a>
    </div>
    <p style="color:#888;font-size:13px;text-align:center;">To stop reminders, reply STOP to any reminder email.</p>
  </div>
</div>
</body>
</html>`,
    });
    console.log(`[ServiceReminder] Confirmation email sent to ${email}`);
  } catch (err) {
    console.error(`[ServiceReminder] Failed to send confirmation to ${email}:`, err);
  }
}
