import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, MapPin, Globe, Heart, Users } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const missions = [
  {
    name: "Jordan River, Israel",
    description: "Performing baptisms where Jesus was baptized by John the Baptist",
    href: "/missions/jordan",
    location: "Israel"
  },
  {
    name: "Israel",
    description: "Walking the holy streets of Jerusalem and sacred sites",
    href: "/missions/jerusalem",
    location: "Jerusalem"
  },
  {
    name: "Cambodia",
    description: "Supporting entrepreneurs and communities rising from hardship",
    href: "/missions/cambodia",
    location: "Southeast Asia"
  },
  {
    name: "Animal Conservation in Thailand",
    description: "Caring for God's magnificent creatures at elephant sanctuaries",
    href: "/missions/thailand",
    location: "Southeast Asia"
  },
  {
    name: "Egypt",
    description: "Following the path of the Holy Family through ancient lands",
    href: "/missions/egypt",
    location: "North Africa"
  },
  {
    name: "Ethiopia",
    description: "Connecting with the ancient cradle of Christianity",
    href: "/missions/ethiopia",
    location: "East Africa"
  }
];

export default function Missions() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Our Missions | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
              data-testid="heading-missions-title"
            >
              A Mission First Ministry
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Going into all the world, just as Jesus commanded
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Go</h3>
              <p className="text-muted-foreground text-sm">
                We don't wait for people to come to us. We go to them, across oceans and borders.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Serve</h3>
              <p className="text-muted-foreground text-sm">
                We meet people where they are, serving their physical and spiritual needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect</h3>
              <p className="text-muted-foreground text-sm">
                We build lasting relationships that transcend cultures and continents.
              </p>
            </div>
          </div>

          <div className="prose prose-lg text-muted-foreground max-w-none mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Mission First?</h2>
            <p>
              The Traveling Church was founded on a simple but profound conviction: the church 
              was never meant to stay in one place. From the very beginning, Jesus commanded 
              His followers to "go into all the world and preach the gospel to all creation." 
              This isn't a suggestion—it's the heartbeat of our faith.
            </p>
            <p>
              Too many churches become comfortable within their four walls, focused inward 
              rather than outward. We believe differently. We believe the church is at its 
              best when it's moving, reaching, serving, and loving across every border and 
              boundary that divides humanity.
            </p>
            <p>
              Being a "Mission First Ministry" means that everything we do is filtered through 
              the lens of the Great Commission. Our resources, our time, our energy—all of it 
              is directed toward reaching people who have never experienced the transformative 
              love of Christ. Whether we're performing baptisms in the Jordan River, supporting 
              entrepreneurs in Cambodia, or caring for elephants in Thailand, every action is 
              an extension of our mission to love God and love people.
            </p>
            <p>
              We don't just send missionaries—we are missionaries. Pastor Brett leads by 
              example, traveling to the places where faith meets real life. And we invite 
              you to join us, whether that's through prayer, financial support, or traveling 
              with us to experience missions firsthand.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-6" data-testid="heading-our-missions">
            Our Mission Fields
          </h2>
          
          <div className="grid gap-4">
            {missions.map((mission, index) => (
              <Link
                key={index}
                href={mission.href}
                className="group flex items-center justify-between p-4 md:p-6 bg-card rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                data-testid={`link-mission-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {mission.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
