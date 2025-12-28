import { useEffect } from "react";
import { Link } from "wouter";
import { programs } from "@/data/programs";
import { Heart, ArrowRight, Shield, HandHeart, Globe, Utensils, Briefcase, FileText } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import programsHeroImage from "@assets/generated_images/global_ministry_helping_community.png";

const iconMap: Record<string, typeof Shield> = {
  shield: Shield,
  "hand-heart": HandHeart,
  globe: Globe,
  utensils: Utensils,
  briefcase: Briefcase,
};

export default function Programs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main>
        <div className="relative">
          <div className="w-full h-48 md:h-64 lg:h-80 overflow-hidden">
            <img
              src={programsHeroImage}
              alt="Our ministry programs helping communities worldwide"
              className="w-full h-full object-cover"
              data-testid="img-programs-hero"
            />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10">
            <div className="programsHeroIcon inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="pt-12 pb-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
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
            {programs.map((program) => {
              const IconComponent = iconMap[program.icon] || Heart;
              return (
                <Link
                  key={program.id}
                  href={`/programs/${program.slug}`}
                  className="group block bg-card rounded-lg shadow-md border border-border p-6 hover:shadow-lg transition-shadow"
                  data-testid={`card-program-${program.slug}`}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
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
              );
            })}
            </div>

            <div className="mt-16 pt-12 border-t border-border">
              <div className="bg-muted rounded-lg p-6 md:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 
                  className="text-2xl font-semibold mb-3"
                  data-testid="heading-daf-section"
                >
                  Donor-Advised Funds (DAF)
                </h2>
                <p 
                  className="text-muted-foreground mb-6 max-w-xl mx-auto"
                  data-testid="text-daf-section"
                >
                  Want to give through a Donor-Advised Fund? We accept DAF grants and can direct your gift to a specific program or where most needed.
                </p>
                <Link
                  href="/donor-advised-funds"
                  className="programsHeroIcon inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  data-testid="button-daf-instructions"
                >
                  DAF Giving Instructions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
