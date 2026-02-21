import { useState } from "react";
import { Calendar, Clock, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string;
  type: string;
  scheduleLabel: string;
  timeLabel: string;
  location: string;
  meetLink: string;
  dialIn: string;
  calStartTime: string;
  calEndTime: string;
}

function getNextThursday(hours: number, minutes: number): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilThursday);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatDateForOutlook(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z/, '+00:00');
}

function generateICS(event: EventData): string {
  const start = new Date(event.calStartTime);
  const end = new Date(event.calEndTime);
  const icsStart = formatDateForGoogle(start);
  const icsEnd = formatDateForGoogle(end);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Traveling Church//EN',
    'BEGIN:VEVENT',
    `DTSTART:${icsStart}`,
    `DTEND:${icsEnd}`,
    `SUMMARY:Traveling Church - ${event.title}`,
    `DESCRIPTION:${event.description}\\n\\nJoin: ${event.meetLink}\\nDial: ${event.dialIn}`,
    `LOCATION:${event.meetLink}`,
    `URL:${event.meetLink}`,
    'RRULE:FREQ=WEEKLY;BYDAY=TH',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(event: EventData) {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getGoogleCalendarUrl(event: EventData): string {
  const start = new Date(event.calStartTime);
  const end = new Date(event.calEndTime);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Traveling Church - ${event.title}`,
    dates: `${formatDateForGoogle(start)}/${formatDateForGoogle(end)}`,
    details: `${event.description}\n\nJoin: ${event.meetLink}\nDial: ${event.dialIn}`,
    location: event.meetLink,
    recur: 'RRULE:FREQ=WEEKLY;BYDAY=TH',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getOutlookCalendarUrl(event: EventData): string {
  const start = new Date(event.calStartTime);
  const end = new Date(event.calEndTime);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `Traveling Church - ${event.title}`,
    startdt: formatDateForOutlook(start),
    enddt: formatDateForOutlook(end),
    body: `${event.description}\n\nJoin: ${event.meetLink}\nDial: ${event.dialIn}`,
    location: event.meetLink,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function AddToCalendarDropdown({ event }: { event: EventData }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 bg-[#c08e00] hover:bg-[#a67a00] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full justify-center"
        data-testid={`btn-add-calendar-${event.id}`}
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg overflow-hidden">
          <a
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
            data-testid={`link-google-cal-${event.id}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#4285F4"/>
              <rect x="5" y="5" width="14" height="14" rx="1" fill="white"/>
              <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4285F4">31</text>
            </svg>
            Google Calendar
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              downloadICS(event);
              setOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
            data-testid={`link-apple-cal-${event.id}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#FF3B30"/>
              <rect x="5" y="5" width="14" height="14" rx="1" fill="white"/>
              <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FF3B30">21</text>
            </svg>
            Apple Calendar
          </a>
          <a
            href={getOutlookCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
            data-testid={`link-outlook-cal-${event.id}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#0078D4"/>
              <rect x="5" y="5" width="14" height="14" rx="1" fill="white"/>
              <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0078D4">O</text>
            </svg>
            Outlook
          </a>
        </div>
      )}
    </div>
  );
}

export function EventCalendar() {
  const nextThursdayEast = getNextThursday(13, 0);
  const nextThursdayCentral = getNextThursday(17, 0);
  const nextThursdayWest = getNextThursday(18, 0);

  const events: EventData[] = [
    {
      id: "bible-study-east",
      title: "Bible Study (East)",
      description: "Weekly Bible study for the East Coast. Join us for deep dives into scripture, fellowship, and spiritual growth together.",
      type: "online",
      scheduleLabel: "Thursdays",
      timeLabel: "8:00 AM EST",
      location: "via Google Meet",
      meetLink: "https://meet.google.com/mya-phhf-qag",
      dialIn: "+1 424-265-1291 PIN: 106812980",
      calStartTime: nextThursdayEast.toISOString(),
      calEndTime: new Date(nextThursdayEast.getTime() + 60 * 60 * 1000).toISOString(),
    },
    {
      id: "bible-study-central",
      title: "Bible Study (Central)",
      description: "Weekly Bible study for the Central timezone. Connect with fellow believers for scripture study, conversation, and community.",
      type: "online",
      scheduleLabel: "Thursdays",
      timeLabel: "12:00 PM EST",
      location: "via Google Meet",
      meetLink: "https://meet.google.com/yhn-fbgs-ibw",
      dialIn: "+1 502-498-8797 PIN: 615065026",
      calStartTime: nextThursdayCentral.toISOString(),
      calEndTime: new Date(nextThursdayCentral.getTime() + 60 * 60 * 1000).toISOString(),
    },
    {
      id: "bible-study-west",
      title: "Bible Study (West)",
      description: "Weekly Bible study for the West Coast. Explore God's word together in fellowship, discussion, and prayer.",
      type: "online",
      scheduleLabel: "Thursdays",
      timeLabel: "1:00 PM EST",
      location: "via Google Meet",
      meetLink: "https://meet.google.com/gmm-skpt-xri",
      dialIn: "+1 720-500-3075 PIN: 158815756",
      calStartTime: nextThursdayWest.toISOString(),
      calEndTime: new Date(nextThursdayWest.getTime() + 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <section id="events" className="pt-12 md:pt-18 pb-16 md:pb-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-testid="text-events-title"
          >
            Upcoming Gatherings
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-events-subtitle"
          >
            Join us for worship, fellowship, and spiritual growth wherever you are
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-card rounded-lg overflow-hidden shadow-md border border-border hover:border-primary transition-colors"
              data-testid={`card-event-${event.id}`}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <span 
                    className="text-sm font-medium text-primary uppercase"
                    data-testid={`text-event-type-${event.id}`}
                  >
                    {event.type}
                  </span>
                </div>

                <h3 
                  className="text-xl font-semibold text-foreground mb-2"
                  data-testid={`text-event-title-${event.id}`}
                >
                  {event.title}
                </h3>

                <p 
                  className="text-muted-foreground text-sm mb-4"
                  data-testid={`text-event-description-${event.id}`}
                >
                  {event.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary" data-testid={`text-event-date-${event.id}`}>
                      {event.scheduleLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span data-testid={`text-event-time-${event.id}`}>
                      {event.timeLabel}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-event-location-${event.id}`}>
                  {event.location}
                </p>

                <AddToCalendarDropdown event={event} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
