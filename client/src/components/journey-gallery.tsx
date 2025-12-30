import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import type { Location } from "@shared/schema";

const missionLinks: Record<string, string> = {
  "Ethiopia": "/missions/ethiopia",
  "Jerusalem": "/missions/jerusalem",
  "Egypt": "/missions/egypt",
  "Cambodia": "/missions/cambodia",
  "Thailand": "/missions/thailand",
  "The Jordan River": "/missions/jordan"
};

const displayNames: Record<string, string> = {
  "Jerusalem": "Israel",
  "Thailand": "Animal Conservation in Thailand"
};

export default function JourneyGallery() {
  const { data: locations, isLoading, error } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  if (isLoading) {
    return (
      <section id="journey" className="py-12 md:py-16 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center">
            Our Missions
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Following the footsteps of the apostles, spreading faith across continents
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <div className="w-24 h-4 bg-muted rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-muted rounded"></div>
                    <div className="w-3/4 h-3 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="journey" className="py-12 md:py-16 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center">
            Our Missions
          </h2>
          <div className="text-center text-muted-foreground">
            Unable to load travel locations. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  const desiredOrder = ['The Jordan River', 'Jerusalem', 'Cambodia', 'Thailand', 'Egypt', 'Ethiopia'];
  const sortedLocations = locations?.sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.name);
    const indexB = desiredOrder.indexOf(b.name);
    return indexA - indexB;
  });

  return (
    <section id="journey" className="py-12 md:py-16 px-4 bg-muted">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center"
          data-testid="text-journey-title"
        >
          Our Missions
        </h2>
        <p 
          className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto"
          data-testid="text-journey-subtitle"
        >
          Following the footsteps of the apostles, spreading faith across continents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedLocations?.map((location) => {
            const missionLink = missionLinks[location.name];
            const displayName = displayNames[location.name] || location.name;
            const CardWrapper = missionLink ? Link : 'div';
            const cardProps = missionLink 
              ? { href: missionLink, className: "gallery-card bg-card rounded-lg overflow-hidden shadow-md block cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" }
              : { className: "gallery-card bg-card rounded-lg overflow-hidden shadow-md group" };
            
            return (
              <CardWrapper
                key={location.id}
                {...cardProps as any}
                data-testid={`card-location-${location.id}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={location.imageUrl}
                    alt={`${location.name} landscape`}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    data-testid={`img-location-${location.id}`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span 
                      className="text-sm font-medium text-secondary"
                      data-testid={`text-location-name-${location.id}`}
                    >
                      {displayName}
                    </span>
                  </div>
                  <p 
                    className="text-sm text-muted-foreground leading-relaxed"
                    data-testid={`text-location-description-${location.id}`}
                  >
                    {location.description}
                  </p>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
