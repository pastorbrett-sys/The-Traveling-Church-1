import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Clock, Globe, Calendar, MessageCircle, Video, Users, ChevronRight, Radio } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import AddToCalendar from "@/components/add-to-calendar";
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
  meetLink?: string;
  dialIn?: string;
}

const SERVICES: ServiceInfo[] = [
  {
    id: "bible-study-east",
    name: "Bible Study (East)",
    description: "Weekly Bible study for the East Coast. Join us for deep dives into scripture, fellowship, and spiritual growth together.",
    day: "Thursdays",
    timeUTC: "13:00",
    hourUTC: 13,
    minuteUTC: 0,
    dayOfWeekUTC: 4,
    icon: Users,
    platform: "Google Meet",
    meetLink: "https://meet.google.com/mya-phhf-qag",
    dialIn: "+1 424-265-1291 PIN: 106812980",
  },
  {
    id: "bible-study-central",
    name: "Bible Study (Central)",
    description: "Weekly Bible study for the Central timezone. Connect with fellow believers for scripture study, conversation, and community.",
    day: "Thursdays",
    timeUTC: "17:00",
    hourUTC: 17,
    minuteUTC: 0,
    dayOfWeekUTC: 4,
    icon: Globe,
    platform: "Google Meet",
    meetLink: "https://meet.google.com/yhn-fbgs-ibw",
    dialIn: "+1 502-498-8797 PIN: 615065026",
  },
  {
    id: "bible-study-west",
    name: "Bible Study (West)",
    description: "Weekly Bible study for the West Coast. Explore God's word together in fellowship, discussion, and prayer.",
    day: "Thursdays",
    timeUTC: "18:00",
    hourUTC: 18,
    minuteUTC: 0,
    dayOfWeekUTC: 4,
    icon: Clock,
    platform: "Google Meet",
    meetLink: "https://meet.google.com/gmm-skpt-xri",
    dialIn: "+1 720-500-3075 PIN: 158815756",
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

function getLiveService(): ServiceInfo | null {
  const now = new Date();
  const dayUTC = now.getUTCDay();
  const hourUTC = now.getUTCHours();
  const minuteUTC = now.getUTCMinutes();
  const nowMinutes = hourUTC * 60 + minuteUTC;

  for (const s of SERVICES) {
    if (s.dayOfWeekUTC !== dayUTC) continue;
    const startMin = s.hourUTC * 60 + s.minuteUTC;
    const endMin = startMin + 60;
    if (nowMinutes >= startMin && nowMinutes < endMin) return s;
  }
  return null;
}

const whatsappLink = "https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc";

const IMAGES = [
  { src: edenImage, alt: "Eden Gulilat" },
  { src: danielImage, alt: "Daniel Stockdale" },
  { src: robbieImage, alt: "Robbie Thiessen" },
  { src: joshImage, alt: "Joshua Castillo" },
];

function fisherYatesShuffle(arr: number[]): number[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.every((v, i) => v === i)) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

function useImageShuffle() {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [transforms, setTransforms] = useState<string[]>(["none", "none", "none", "none"]);
  const [showTransition, setShowTransition] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasRun = useRef(false);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    imageRefs.current[index] = el;
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const startTimer = setTimeout(() => {
      const rects = imageRefs.current.map(el => el?.getBoundingClientRect());
      if (rects.some(r => !r)) {
        setVisible(true);
        return;
      }

      const origins = rects.map(r => ({ x: r!.left, y: r!.top }));

      function calcTransforms(order: number[]): string[] {
        return [0, 1, 2, 3].map(currentIdx => {
          const targetIdx = order[currentIdx];
          const dx = origins[targetIdx].x - origins[currentIdx].x;
          const dy = origins[targetIdx].y - origins[currentIdx].y;
          return `translate(${dx}px, ${dy}px)`;
        });
      }

      setTransforms(calcTransforms(fisherYatesShuffle([0, 1, 2, 3])));
      setVisible(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowTransition(true);
          const t1 = setTimeout(() => setTransforms(calcTransforms(fisherYatesShuffle([0, 1, 2, 3]))), 200);
          const t2 = setTimeout(() => setTransforms(calcTransforms(fisherYatesShuffle([0, 1, 2, 3]))), 450);
          const t3 = setTimeout(() => setTransforms(calcTransforms(fisherYatesShuffle([0, 1, 2, 3]))), 700);
          const t4 = setTimeout(() => {
            setTransforms(["none", "none", "none", "none"]);
          }, 950);
          const t5 = setTimeout(() => setShowTransition(false), 1300);
          return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
        });
      });
    }, 150);

    return () => clearTimeout(startTimer);
  }, []);

  return { setRef, transforms, showTransition, visible };
}

export default function FindAService() {
  const [detectedTimezone, setDetectedTimezone] = useState("");
  const [liveService, setLiveService] = useState<ServiceInfo | null>(null);
  const { setRef, transforms, showTransition, visible } = useImageShuffle();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Find an Online Service | The Traveling Church";
    setDetectedTimezone(getShortTimezone());
    setLiveService(getLiveService());
    const interval = setInterval(() => setLiveService(getLiveService()), 30000);
    return () => clearInterval(interval);
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

      {liveService && liveService.meetLink && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#1a1a1a] shadow-lg" data-testid="banner-live-session">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-white text-sm font-medium truncate">
                {liveService.name}
              </span>
            </div>
            <a
              href={liveService.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#c08e00] hover:bg-[#a67a00] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
              data-testid="btn-join-live"
            >
              <Radio className="w-3.5 h-3.5" />
              Join Live
            </a>
          </div>
        </div>
      )}

      <section className="relative overflow-visible bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-0 md:pt-[154px] md:pb-24 z-20">
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
                onClick={() => { window.gtag?.('event', 'click_view_services'); }}
                className="donateSectionBtn inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg w-full sm:w-fit animate-bounce-rotate relative z-[60]"
                data-testid="button-view-services"
              >
                View Service Times
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="order-1 md:order-2 grid grid-cols-2 gap-4 md:gap-5 mt-8 md:-mt-16 md:scale-[0.85] transform-gpu md:origin-right">
              <div className="space-y-4 md:space-y-5">
                {[0, 1].map(i => (
                  <div
                    key={i}
                    ref={setRef(i)}
                    className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none"
                    style={{
                      transform: transforms[i],
                      transition: showTransition ? "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                      opacity: visible ? 1 : 0,
                      zIndex: showTransition ? 10 : "auto",
                    }}
                  >
                    <img src={IMAGES[i].src} alt={IMAGES[i].alt} className="w-full h-full object-cover" loading="eager" />
                  </div>
                ))}
              </div>
              <div className="space-y-4 md:space-y-5 pt-8">
                {[2, 3].map(i => (
                  <div
                    key={i}
                    ref={setRef(i)}
                    className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 md:border-0 md:shadow-none"
                    style={{
                      transform: transforms[i],
                      transition: showTransition ? "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                      opacity: visible ? 1 : 0,
                      zIndex: showTransition ? 10 : "auto",
                    }}
                  >
                    <img src={IMAGES[i].src} alt={IMAGES[i].alt} className="w-full h-full object-cover" loading={i === 2 ? "eager" : "lazy"} />
                  </div>
                ))}
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
                      <AddToCalendar
                        serviceId={service.id}
                        event={{
                          title: `${service.name} — The Traveling Church`,
                          description: service.description,
                          location: service.meetLink || "Online",
                          hourUTC: service.hourUTC,
                          minuteUTC: service.minuteUTC,
                          dayOfWeekUTC: service.dayOfWeekUTC,
                          durationMinutes: 60,
                        }}
                      />
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
            onClick={() => { window.gtag?.('event', 'click_whatsapp_join'); }}
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
