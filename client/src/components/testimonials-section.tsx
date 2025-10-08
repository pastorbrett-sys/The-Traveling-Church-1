import { useQuery } from "@tanstack/react-query";
import { Quote, Loader2 } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export function TestimonialsSection() {
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="py-16 md:py-24 bg-background">
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
      <section id="testimonials" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Unable to load testimonials. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-testid="text-testimonials-title"
          >
            Stories of Transformation
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-testimonials-subtitle"
          >
            Hear from people around the world who have experienced God's love through The Traveling Church
          </p>
        </div>

        {testimonials && testimonials.length === 0 ? (
          <div className="text-center text-muted-foreground" data-testid="text-no-testimonials">
            No testimonials yet. Be the first to share your story!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials?.map((testimonial) => (
              <article
                key={testimonial.id}
                className="bg-card rounded-lg p-6 shadow-md border border-border relative"
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <div className="relative z-10">
                  <p 
                    className="text-muted-foreground leading-relaxed mb-6 italic"
                    data-testid={`text-testimonial-content-${testimonial.id}`}
                  >
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-border pt-4">
                    <p 
                      className="font-semibold text-foreground"
                      data-testid={`text-testimonial-name-${testimonial.id}`}
                    >
                      {testimonial.name}
                    </p>
                    <p 
                      className="text-sm text-muted-foreground"
                      data-testid={`text-testimonial-location-${testimonial.id}`}
                    >
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
