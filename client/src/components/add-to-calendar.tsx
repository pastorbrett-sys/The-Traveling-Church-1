import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  hourUTC: number;
  minuteUTC: number;
  dayOfWeekUTC: number;
  durationMinutes: number;
}

function getNextEventDate(dayOfWeekUTC: number, hourUTC: number, minuteUTC: number): Date {
  const now = new Date();
  const currentDay = now.getUTCDay();
  let daysUntil = dayOfWeekUTC - currentDay;
  if (daysUntil < 0) {
    daysUntil += 7;
  } else if (daysUntil === 0) {
    const eventTimeToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUTC, minuteUTC, 0));
    if (now >= eventTimeToday) {
      daysUntil = 7;
    }
  }
  const nextDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil, hourUTC, minuteUTC, 0));
  return nextDate;
}

function formatUTCTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
}

function formatDateForOutlook(d: Date): string {
  return d.toISOString();
}

function getUserTimezoneId(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const start = getNextEventDate(event.dayOfWeekUTC, event.hourUTC, event.minuteUTC);
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const tz = getUserTimezoneId();

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatUTCTimestamp(start)}/${formatUTCTimestamp(end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&ctz=${encodeURIComponent(tz)}`;
}

function generateOutlookUrl(event: CalendarEvent): string {
  const start = getNextEventDate(event.dayOfWeekUTC, event.hourUTC, event.minuteUTC);
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);

  return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(event.title)}&startdt=${formatDateForOutlook(start)}&enddt=${formatDateForOutlook(end)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
}

function getICSUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    title: event.title,
    description: event.description,
    location: event.location,
    hourUTC: String(event.hourUTC),
    minuteUTC: String(event.minuteUTC),
    dayOfWeekUTC: String(event.dayOfWeekUTC),
    durationMinutes: String(event.durationMinutes),
  });
  return `/api/calendar/event.ics?${params.toString()}`;
}

interface AddToCalendarProps {
  event: CalendarEvent;
  serviceId: string;
}

export default function AddToCalendar({ event, serviceId }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleCalendar = () => {
    window.gtag?.('event', 'click_add_calendar');
    window.gtag?.('event', 'service_registration', { service_name: event.title, method: 'google_calendar' });
    window.open(generateGoogleCalendarUrl(event), "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleAppleCalendar = () => {
    window.gtag?.('event', 'click_add_calendar');
    window.gtag?.('event', 'service_registration', { service_name: event.title, method: 'apple_calendar' });
    window.location.href = getICSUrl(event);
    setIsOpen(false);
  };

  const handleOutlook = () => {
    window.gtag?.('event', 'click_add_calendar');
    window.gtag?.('event', 'service_registration', { service_name: event.title, method: 'outlook' });
    window.open(generateOutlookUrl(event), "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleOtherCalendar = () => {
    window.gtag?.('event', 'click_add_calendar');
    window.gtag?.('event', 'service_registration', { service_name: event.title, method: 'other_calendar' });
    window.location.href = getICSUrl(event);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
        data-testid={`button-add-calendar-${serviceId}`}
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in"
          data-testid={`dropdown-calendar-${serviceId}`}
        >
          <button
            onClick={handleGoogleCalendar}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            data-testid={`button-google-calendar-${serviceId}`}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M18 3H6C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3Z" fill="#4285F4"/>
              <path d="M15.5 8.5L12 12L8.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="6" width="10" height="12" rx="1" fill="white" fillOpacity="0.9"/>
              <path d="M9 10H15M9 13H15M9 16H13" stroke="#4285F4" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            Google Calendar
          </button>
          <button
            onClick={handleAppleCalendar}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            data-testid={`button-apple-calendar-${serviceId}`}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#FF3B30"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">
                {new Date().getDate()}
              </text>
            </svg>
            Apple Calendar
          </button>
          <button
            onClick={handleOutlook}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            data-testid={`button-outlook-calendar-${serviceId}`}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#0078D4"/>
              <path d="M8 9L12 12L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="8" width="10" height="8" rx="1" stroke="white" strokeWidth="1.2" fill="none"/>
            </svg>
            Outlook
          </button>
          <button
            onClick={handleOtherCalendar}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-t border-border"
            data-testid={`button-other-calendar-${serviceId}`}
          >
            <Calendar className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
            Other Calendar
          </button>
        </div>
      )}
    </div>
  );
}
