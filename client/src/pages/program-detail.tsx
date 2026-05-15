import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { programs } from "@/data/programs";
import { Heart, ArrowLeft, CheckCircle, Shield, HandHeart, Globe, Utensils, Briefcase, Leaf } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { DonationWidget } from "@/components/donation-widget";

import ironMenImage from "@assets/generated_images/men's_support_group_meeting.png";
import persecutedChristiansImage from "@assets/generated_images/christians_receiving_humanitarian_aid.png";
import globalMinistryImage from "@assets/generated_images/traveling_minister_meeting_people.png";
import communityFeedingImage from "@assets/generated_images/community_food_distribution_volunteers.png";
import communityActivitiesImage from "@assets/community-activities_1775640257848.png";
import communityFundsImage from "@assets/IMG_4716_1775640462445.jpg";
import economicEmpowermentImage from "@assets/generated_images/business_training_entrepreneurs_workshop.png";
import animalConservationImage from "@assets/generated_images/animal_conservation_volunteers_caring.png";

const iconMap: Record<string, typeof Shield> = {
  shield: Shield,
  "hand-heart": HandHeart,
  globe: Globe,
  utensils: Utensils,
  briefcase: Briefcase,
  leaf: Leaf,
};

const imageMap: Record<string, string> = {
  "iron-men": ironMenImage,
  "persecuted-christians": persecutedChristiansImage,
  "global-ministry": globalMinistryImage,
  "community-feeding": communityFeedingImage,
  "economic-empowerment": economicEmpowermentImage,
  "animal-conservation": animalConservationImage,
};

const videoMap: Record<string, string> = {
  "community-feeding": "/videos/community-food-distribution.mp4",
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
      
      <main className="pt-5 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Link>

          <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
            {videoMap[program.image] ? (
              <div className="w-full h-64 md:h-96 overflow-hidden bg-black">
                <video
                  className="w-full h-full object-cover block"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={imageMap[program.image]}
                  data-testid="video-program-banner"
                >
                  <source src={videoMap[program.image]} type="video/mp4" />
                </video>
              </div>
            ) : imageMap[program.image] && (
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
              <div className="max-w-md mx-auto">
                <DonationWidget programName={program.title} compact />
              </div>

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
                {program.image === "community-feeding" && (
                  <div className="mt-6 rounded-xl overflow-hidden shadow-md">
                    <img src={communityActivitiesImage} alt="Community feeding activities" className="w-full h-auto block" data-testid="img-activities-supplement" />
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-use-of-funds">
                  Use of Funds
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-use-of-funds">
                  {program.useOfFunds}
                </p>
                {program.image === "community-feeding" && (
                  <div className="mt-6 rounded-xl overflow-hidden shadow-md">
                    <img src={communityFundsImage} alt="Global Kids Bible Study Pakistan - food distribution" className="w-full h-auto block" data-testid="img-funds-supplement" />
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-oversight">
                  Oversight
                </h2>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-oversight">
                  {program.oversight}
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
