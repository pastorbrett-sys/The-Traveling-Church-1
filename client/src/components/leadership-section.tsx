import { useState, useEffect } from "react";
import danielImage from "../assets/Daniel_1760680915194.jpg";
import joshImage from "../assets/Josh_1760681040173.jpg";
import edenImage from "../assets/Eden_1771354464709.png";
import robbieImage from "../assets/Robbie_1771354535845.png";

export default function LeadershipSection() {
  const initialLeaders = [
    {
      name: "Eden Gulilat",
      title: "Central Regional Ministry Leader",
      image: edenImage,
      description: "Leading ministry efforts across the central region with a focus on community empowerment and spiritual growth.",
    },
    {
      name: "Robbie Thiessen",
      title: "Western Regional Ministry Leader",
      image: robbieImage,
      description: "Overseeing western regional outreach, dedicated to teaching the Gospel and growing faith in the West.",
    },
    {
      name: "Daniel Stockdale",
      title: "Treasurer",
      image: danielImage,
      description: "Dedicated to spreading faith and building community through servant leadership and compassion.",
    },
    {
      name: "Joshua Castillo",
      title: "Community Growth",
      image: joshImage,
      description: "Passionate about connecting cultures and bringing people together in faith and fellowship.",
    },
  ];

  const [leaders, setLeaders] = useState(initialLeaders);
  const [isShuffling, setIsShuffling] = useState(true);

  useEffect(() => {
    // Shuffle animation effect
    let count = 0;
    const maxShuffles = 8;
    const interval = setInterval(() => {
      setLeaders(prev => [...prev].sort(() => Math.random() - 0.5));
      count++;
      
      if (count >= maxShuffles) {
        clearInterval(interval);
        // Land in original order
        setTimeout(() => {
          setLeaders(initialLeaders);
          setIsShuffling(false);
        }, 150);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  return (
    <section id="leadership" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12" data-testid="heading-leadership">
          Church Leadership
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 transition-all duration-500">
          {leaders.map((leader, index) => {
            const slug = createSlug(leader.name);
            return (
              <div
                key={leader.name}
                className={`flex flex-col items-center text-center transition-all duration-500 ease-in-out ${
                  isShuffling ? "scale-95 opacity-80 blur-[1px]" : "scale-100 opacity-100 blur-0"
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
                data-testid={`card-leader-${slug}`}
              >
                <div className="w-48 h-48 md:w-56 md:h-56 mb-6 rounded-full overflow-hidden ring-4 ring-primary/10 hover:ring-primary/30 transition-all duration-300">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    data-testid={`img-leader-${slug}`}
                    loading="lazy"
                  />
                </div>
                <h3
                  className="text-2xl md:text-3xl font-semibold mb-2"
                  data-testid={`text-leader-name-${slug}`}
                >
                  {leader.name}
                </h3>
                <p
                  className="text-sm md:text-base text-primary font-medium mb-3"
                  data-testid={`text-leader-title-${slug}`}
                >
                  {leader.title}
                </p>
                <p
                  className="text-muted-foreground max-w-md"
                  data-testid={`text-leader-description-${slug}`}
                >
                  {leader.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
