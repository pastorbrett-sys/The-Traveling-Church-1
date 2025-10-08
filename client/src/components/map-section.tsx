import { useQuery } from "@tanstack/react-query";
import { MapPin, Loader2 } from "lucide-react";
import type { Location } from "@shared/schema";

export function MapSection() {
  const { data: locations, isLoading, error } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  if (isLoading) {
    return (
      <section id="map" className="py-16 md:py-24 bg-background">
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
      <section id="map" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Unable to load locations. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="map" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-testid="text-map-title"
          >
            Where We've Been
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-map-subtitle"
          >
            Follow our journey around the world as we spread the message of hope and love
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Map Display */}
          <div 
            className="bg-card rounded-lg overflow-hidden shadow-lg border border-border h-[400px] md:h-[500px]"
            data-testid="container-map"
          >
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik`}
              style={{ border: 0 }}
              title="World Map of Locations"
              data-testid="iframe-map"
            />
          </div>

          {/* Locations List */}
          <div className="space-y-4" data-testid="list-locations">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Locations Visited
            </h3>
            {locations && locations.length > 0 ? (
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                    data-testid={`card-location-${location.id}`}
                  >
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-foreground"
                        data-testid={`text-location-name-${location.id}`}
                      >
                        {location.name}
                      </h4>
                      <p 
                        className="text-sm text-muted-foreground"
                        data-testid={`text-location-country-${location.id}`}
                      >
                        {location.country}
                      </p>
                      {location.description && (
                        <p 
                          className="text-sm text-muted-foreground mt-2"
                          data-testid={`text-location-description-${location.id}`}
                        >
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground" data-testid="text-no-locations">
                No locations yet. Check back soon as we travel the world!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
