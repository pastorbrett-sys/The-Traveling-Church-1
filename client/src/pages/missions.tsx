import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Globe } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroVideo from "@assets/text-to-video-ffe46d5c_(1)_1767132632981.mp4?url";
import jordanHero from "@assets/IMG_1160_1767129664288.jpg";
import israelHero from "@assets/generated_images/jerusalem_western_wall_sunset_view.png";
import cambodiaHero from "@assets/IMG_5162_1767126443573.jpg";
import thailandHero from "@assets/29A7ED8A-129F-4983-AB5E-5D32A7EBD688_1767128055581.jpg";
import egyptHero from "@assets/__Red_Sea_1767124933007.jpg";
import ethiopiaHero from "@assets/IMG_2260_1767118533609.jpg";

const missions = [
  {
    name: "Jordan River",
    tagline: "Baptized in sacred waters",
    image: jordanHero,
    href: "/missions/jordan"
  },
  {
    name: "Israel",
    tagline: "Walking where Jesus walked",
    image: israelHero,
    href: "/missions/jerusalem"
  },
  {
    name: "Cambodia",
    tagline: "Empowering communities",
    image: cambodiaHero,
    href: "/missions/cambodia"
  },
  {
    name: "Thailand",
    tagline: "Caring for God's creatures",
    image: thailandHero,
    href: "/missions/thailand"
  },
  {
    name: "Egypt",
    tagline: "Path of the Holy Family",
    image: egyptHero,
    href: "/missions/egypt"
  },
  {
    name: "Ethiopia",
    tagline: "Cradle of ancient faith",
    image: ethiopiaHero,
    href: "/missions/ethiopia"
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
      
      <main>
        <section className="relative h-[60vh] min-h-[400px]">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            data-testid="video-missions-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <Globe className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-4" strokeWidth={1.5} />
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                data-testid="heading-missions-title"
              >
                Mission First
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-xl mx-auto">
                Go therefore and make disciples of all nations
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 px-4 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              We go where others won't. Into the difficult places, the forgotten corners, 
              the regions that need the gospel most.
            </p>
            <p className="text-muted-foreground mt-4 text-sm md:text-base">
              Explore our recent missions below
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 bg-muted">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {missions.map((mission, index) => (
                <Link
                  key={index}
                  href={mission.href}
                  className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg shadow-lg"
                  data-testid={`link-mission-${index}`}
                >
                  <img
                    src={mission.image}
                    alt={mission.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                      {mission.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-2">
                      {mission.tagline}
                    </p>
                    <span className="inline-flex items-center text-xs text-white/70 group-hover:text-white transition-colors">
                      Explore <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl text-muted-foreground italic">
              "Go into all the world and preach the gospel to all creation."
            </p>
            <p className="text-sm text-muted-foreground mt-4">— Mark 16:15</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
