import { Calendar, MapPin, Clock, Globe } from "lucide-react";

export function EventCalendar() {
  const events = [
    {
      id: "mens-group",
      title: "Mens Group",
      description: "Weekly gathering every Friday for men to connect, share openly, and build strength together. A safe space for honest conversation and spiritual growth.",
      type: "online",
      scheduleLabel: "Every Friday",
      timeLabel: "8-9pm EDT",
      location: "Remote"
    },
    {
      id: "international-vibe",
      title: "International Vibe Service",
      description: "Join us for an informal worship experience filled with fellowship, conversation, education and a deep dive into the word. Lets celebrate faith and community together from all over the Globe.",
      type: "online",
      scheduleLabel: "Every Week Sunday",
      timeLabel: "Noon-1:30PM EDT",
      location: "Remote"
    }
  ];

  return (
    <section id="events" className="py-16 md:py-24 bg-muted/30">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
