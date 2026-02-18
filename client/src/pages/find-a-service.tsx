import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Clock, Globe, Calendar, MessageCircle, Video, Users, ChevronRight } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import edenImage from "../assets/Eden_1771354464709.png";
import robbieImage from "../assets/Robbie_1771354535845.png";
import danielImage from "../assets/Daniel_1760680915194.jpg";
import joshImage from "../assets/Josh_1760681040173.jpg";

interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  day: string;
  timeUTC: string;
  hourUTC: number;
  minuteUTC: number;
  dayOfWeekUTC: number;
  icon: typeof Clock;
  platform: string;
}

const SERVICES: ServiceInfo[] = [
  {
    id: "sunday-worship",
    name: "Sunday Worship Service",
    description: "Our main weekly gathering with worship, teaching, and community prayer.",
    day: "Sundays",
    timeUTC: "15:00",
    hourUTC: 15,
    minuteUTC: 0,
    dayOfWeekUTC: 0,
    icon: Users,
    platform: "Google Meet",
  },
  {
    id: "wednesday-bible-study",
    name: "Wednesday Bible Study",
    description: "Midweek deep-dive into Scripture with group discussion and Q&A.",
    day: "Wednesdays",
    timeUTC: "0:00",
    hourUTC: 0,
    minuteUTC: 0,
    dayOfWeekUTC: 3,
    icon: Globe,
    platform: "Google Meet",
  },
  {
    id: "friday-prayer",
    name: "Friday Night Prayer",
    description: "End the week in focused prayer for our global community and personal needs.",
    day: "Fridays",
    timeUTC: "1:00",
    hourUTC: 1,
    minuteUTC: 0,
    dayOfWeekUTC: 5,
    icon: Clock,
    platform: "Google Meet",
  },
  {
    id: "monthly-worship-night",
    name: "Monthly Worship Night",
    description: "A special evening of extended worship and testimony — first Saturday of every month.",
    day: "1st Saturday",
    timeUTC: "23:00",
    hourUTC: 23,
    minuteUTC: 0,
    dayOfWeekUTC: 6,
    icon: Video,
    platform: "Google Meet",
  },
];

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatTimeInUserTimezone(hourUTC: number, minuteUTC: number): string {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUTC, minuteUTC, 0));
  return utcDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short" });
}

function getShortTimezone(): string {
  try {
    const tz = getUserTimezone();
    const parts = tz.split("/");
    return parts[parts.length - 1].replace(/_/g, " ");
  } catch {
    return "your timezone";
  }
}

function generateCalendarUrl(service: ServiceInfo): string {
  const now = new Date();
  const nextDate = new Date(now);
  const currentDay = now.getUTCDay();
  let daysUntil = service.dayOfWeekUTC - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  nextDate.setUTCDate(now.getUTCDate() + daysUntil);
  nextDate.setUTCHours(service.hourUTC, service.minuteUTC, 0, 0);

  const endDate = new Date(nextDate.getTime() + 90 * 60 * 1000);

  const formatGCal = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + " — The Traveling Church")}&dates=${formatGCal(nextDate)}/${formatGCal(endDate)}&details=${encodeURIComponent(service.description)}&location=Online`;
}

const whatsappLink = "https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc";

export default function FindAService() {
  const [detectedTimezone, setDetectedTimezone] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Find an Online Service | The Traveling Church";
    setDetectedTimezone(getShortTimezone());
  }, []);

  const localizedServices = useMemo(() => {
    return SERVICES.map((s) => ({
      ...s,
      localTime: formatTimeInUserTimezone(s.hourUTC, s.minuteUTC),
    }));
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      <section className="relative overflow-visible bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-0 md:pt-[224px] md:pb-24 z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1 text-center md:text-left">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3" data-testid="text-hero-eyebrow">
                Online Services
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5"
                data-testid="heading-find-service-hero"
              >A Global Community for Anyone Anywhere</h1>
              <p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0"
                data-testid="text-find-service-subhead"
              >
                Bible-centered worship and community, no matter where you are in the world.
              </p>
              <a
                href="#services"
                className="donateSectionBtn inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg w-full sm:w-fit animate-bounce-rotate relative z-[60]"
                data-testid="button-view-services"
              >
                View Service Times
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="order-1 md:order-2 grid grid-cols-2 gap-4 md:gap-5 mt-8 md:-mt-16 md:scale-[0.85] transform-gpu md:origin-right">
              <div className="space-y-4 md:space-y-5">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none">
                  <img src={edenImage} alt="Eden Gulilat" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none">
                  <img src={danielImage} alt="Daniel Stockdale" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
              <div className="space-y-4 md:space-y-5 pt-8">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none">
                  <img src={robbieImage} alt="Robbie Thiessen" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none">
                  <img src={joshImage} alt="Joshua Castillo" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="services" className="py-16 md:py-24 bg-muted/50 scroll-mt-20 md:-mt-[100px] relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              data-testid="heading-service-times"
            >
              Service Times
            </h2>
            {detectedTimezone && (
              <p className="text-muted-foreground" data-testid="text-detected-timezone">
                <Clock className="w-4 h-4 inline mr-1 -mt-0.5" />
                Showing times for <span className="font-medium text-foreground">{detectedTimezone}</span>
              </p>
            )}
          </div>

          <div className="grid gap-5">
            {localizedServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-service-${service.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1" data-testid={`text-service-name-${service.id}`}>
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                          <Calendar className="w-4 h-4" />
                          {service.day}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4" />
                          {service.localTime}
                        </span>
                        <span className="text-muted-foreground">
                          via {service.platform}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={generateCalendarUrl(service)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
                        data-testid={`button-rsvp-${service.id}`}
                      >
                        <Calendar className="w-4 h-4" />
                        Add to Calendar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-background -mt-[50px] md:mt-0">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            data-testid="heading-why-join"
          >
            Why Join Us Online?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col items-center" data-testid="card-why-timezone">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Your Timezone</h3>
              <p className="text-muted-foreground text-sm">
                Service times automatically adjust to wherever you are in the world.
              </p>
            </div>
            <div className="flex flex-col items-center" data-testid="card-why-community">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real Community</h3>
              <p className="text-muted-foreground text-sm">
                Not just a stream — real connection with believers across 6 continents.
              </p>
            </div>
            <div className="flex flex-col items-center" data-testid="card-why-bible">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">On-Demand Access</h3>
              <p className="text-muted-foreground text-sm">
                Can't make it live? Recordings are available so you never miss a message.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="heading-meet-leadership">
            Meet Our Leadership
          </h2>
          <p className="text-muted-foreground mb-8">
            Real people leading a real community — learn more about the team behind The Traveling Church.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/missions"
              className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-medium transition-colors"
              data-testid="link-our-missions"
            >
              Our Missions
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border p-3 md:p-4 md:bg-transparent md:border-0 md:bottom-6 md:right-6 md:left-auto md:w-auto" data-testid="sticky-footer-cta">
        <div className="flex items-center justify-center md:justify-end">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,32%)] text-white px-8 py-3 rounded-full font-medium text-sm transition-colors md:shadow-lg"
            data-testid="button-sticky-whatsapp"
          >
            <MessageCircle className="w-4 h-4" />
            Checkout the WhatsApp Group
          </a>
        </div>
      </div>
    </div>
  );
}
