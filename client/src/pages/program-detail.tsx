import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { programs, DONATE_LINK } from "@/data/programs";
import { Heart, ArrowLeft, CheckCircle, Shield, HandHeart, Globe, Utensils, Briefcase } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import ironMenImage from "@assets/generated_images/men's_support_group_meeting.png";
import persecutedChristiansImage from "@assets/generated_images/christians_receiving_humanitarian_aid.png";
import globalMinistryImage from "@assets/generated_images/traveling_minister_meeting_people.png";
import communityFeedingImage from "@assets/generated_images/community_food_distribution_volunteers.png";
import economicEmpowermentImage from "@assets/generated_images/business_training_entrepreneurs_workshop.png";

const iconMap: Record<string, typeof Shield> = {
  shield: Shield,
  "hand-heart": HandHeart,
  globe: Globe,
  utensils: Utensils,
  briefcase: Briefcase,
};

const imageMap: Record<string, string> = {
  "iron-men": ironMenImage,
  "persecuted-christians": persecutedChristiansImage,
  "global-ministry": globalMinistryImage,
  "community-feeding": communityFeedingImage,
  "economic-empowerment": economicEmpowermentImage,
};

export default function ProgramDetail() {
  const { slug } = useParams<{ slug: string }>();
  const program = programs.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!program) {
    return (
      <div className="bg-background text-foreground antialiased min-h-screen">
        <Navigation />
        <main className="pt-16 pb-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The program you're looking for doesn't exist.
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pt-16 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Link>

          <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
            {imageMap[program.image] && (
              <div className="relative">
                <div className="w-full h-48 md:h-64 overflow-hidden">
                  <img
                    src={imageMap[program.image]}
                    alt={program.title}
                    className="w-full h-full object-cover"
                    data-testid="img-program-banner"
                  />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10">
                  {(() => {
                    const IconComponent = iconMap[program.icon] || Heart;
                    return (
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-lg">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 pt-12 pb-8 px-8 md:px-12 text-center">
              <h1 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
                data-testid="heading-program-title"
              >
                {program.title}
              </h1>
              <p 
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-testid="text-program-short"
              >
                {program.shortDescription}
              </p>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-purpose">
                  Purpose
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-purpose">
                  {program.purpose}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-activities">
                  Activities
                </h2>
                <ul className="space-y-3" data-testid="list-activities">
                  {program.activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{activity}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-use-of-funds">
                  Use of Funds
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-use-of-funds">
                  {program.useOfFunds}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-oversight">
                  Oversight
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-oversight">
                  {program.oversight}
                </p>
              </section>

              <div className="pt-6 border-t border-border text-center">
                <p className="text-lg text-foreground mb-6">
                  Your generosity makes this program possible.
                </p>
                <a
                  href={DONATE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#0077B6] hover:bg-[#00B4D8] text-white px-8 py-4 rounded-full font-medium text-lg transition-colors animate-bounce-rotate"
                  data-testid="button-donate-program"
                >
                  <Heart className="w-5 h-5" />
                  Donate to This Program
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
