import { Link } from "wouter";
import { programs } from "@/data/programs";
import { Heart, ArrowRight } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function Programs() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full animate-pink-pulse mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              data-testid="heading-programs"
            >
              Our Programs
            </h1>
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
              data-testid="text-programs-description"
            >
              Support the work of The Traveling Church through our dedicated ministry programs. 
              Each program serves a unique purpose in spreading God's love around the world.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group block bg-card rounded-lg shadow-md border border-border p-6 hover:shadow-lg transition-shadow"
                data-testid={`card-program-${program.slug}`}
              >
                <h2 
                  className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors"
                  data-testid={`heading-program-${program.slug}`}
                >
                  {program.title}
                </h2>
                <p 
                  className="text-muted-foreground mb-4 line-clamp-3"
                  data-testid={`text-program-${program.slug}`}
                >
                  {program.shortDescription}
                </p>
                <div className="flex items-center text-primary font-medium">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
