import { Calendar, MapPin, Clock, Globe, Video } from "lucide-react";

export function EventCalendar() {
  const events = [
    {
      id: "bible-study-east",
      title: "Bible Study (East)",
      description: "Weekly Bible study for the East Coast. Join us for deep dives into scripture, fellowship, and spiritual growth together.",
      type: "online",
      scheduleLabel: "Every Thursday",
      timeLabel: "8–9 AM EST",
      location: "Google Meet",
      meetLink: "https://meet.google.com/mya-phhf-qag",
      dialIn: "+1 424-265-1291 PIN: 106812980",
    },
    {
      id: "bible-study-central",
      title: "Bible Study (Central)",
      description: "Weekly Bible study for the Central timezone. Connect with fellow believers for scripture study, conversation, and community.",
      type: "online",
      scheduleLabel: "Every Thursday",
      timeLabel: "12–1 PM EST",
      location: "Google Meet",
      meetLink: "https://meet.google.com/yhn-fbgs-ibw",
      dialIn: "+1 502-498-8797 PIN: 615065026",
    },
    {
      id: "bible-study-west",
      title: "Bible Study (West)",
      description: "Weekly Bible study for the West Coast. Explore God's word together in fellowship, discussion, and prayer.",
      type: "online",
      scheduleLabel: "Every Thursday",
      timeLabel: "1–2 PM EST",
      location: "Google Meet",
      meetLink: "https://meet.google.com/gmm-skpt-xri",
      dialIn: "+1 720-500-3075 PIN: 158815756",
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span 
                      className="text-sm font-medium text-primary uppercase"
                      data-testid={`text-event-type-${event.id}`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>

                <h3 
                  className="text-xl font-semibold text-foreground mb-3"
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

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span data-testid={`text-event-date-${event.id}`}>
                      {event.scheduleLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span data-testid={`text-event-time-${event.id}`}>
                      {event.timeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span data-testid={`text-event-location-${event.id}`}>
                      {event.location}
                    </span>
                  </div>
                </div>

                {event.meetLink && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <a
                      href={event.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#c08e00] hover:bg-[#a67a00] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full justify-center"
                      data-testid={`link-join-${event.id}`}
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                    {event.dialIn && (
                      <p className="text-xs text-muted-foreground mt-2 text-center" data-testid={`text-dialin-${event.id}`}>
                        Or dial: {event.dialIn}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
