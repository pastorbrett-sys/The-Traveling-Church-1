import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, Globe, Users, Loader2 } from "lucide-react";
import { format, isFuture } from "date-fns";
import type { Event } from "@shared/schema";

export function EventCalendar() {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <section id="events" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="events" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Unable to load events. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Sort events by date
  const sortedEvents = events?.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  // Filter upcoming events only
  const upcomingEvents = sortedEvents.filter(event => isFuture(new Date(event.date)));

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

        {events && events.length === 0 ? (
          <div className="text-center text-muted-foreground" data-testid="text-no-events">
            No events scheduled yet. Check back soon for upcoming gatherings!
          </div>
        ) : (
          <div>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No upcoming events scheduled. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  
  return (
    <article
      className="bg-card rounded-lg overflow-hidden shadow-md border border-border hover:border-primary transition-colors"
      data-testid={`card-event-${event.id}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {event.type === "online" ? (
              <Globe className="w-5 h-5 text-primary" />
            ) : (
              <Users className="w-5 h-5 text-primary" />
            )}
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
          className="text-muted-foreground text-sm mb-4 line-clamp-3"
          data-testid={`text-event-description-${event.id}`}
        >
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time 
              dateTime={typeof event.date === 'string' ? event.date : event.date.toISOString()}
              data-testid={`text-event-date-${event.id}`}
            >
              {event.scheduleLabel || format(eventDate, "EEEE, MMMM d, yyyy")}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span data-testid={`text-event-time-${event.id}`}>
              {event.timeLabel || format(eventDate, "h:mm a")}
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
  );
}
