import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import heroImage from "@assets/IMG_1239_1767120447756.jpg";
import westernWall from "@assets/IMG_1138_1767120447756.jpg";
import domeOfRock from "@assets/IMG_1271_1767120447754.jpg";
import cityView from "@assets/IMG_1270_1767120447754.jpg";
import templeMountArea from "@assets/IMG_1254_1767120447753.jpg";
import mountOfOlives from "@assets/IMG_1267_1767120447753.jpg";
import israelFlags from "@assets/IMG_1244_1767120447753.jpg";
import gardenTomb from "@assets/IMG_1057_1767120447755.jpg";
import streetLife from "@assets/IMG_0964_1767120447755.jpg";
import hostagePosters from "@assets/IMG_0966_1767120447755.jpg";
import cafeBreak from "@assets/IMG_1221_1767120447756.jpg";
import localDriver from "@assets/IMG_1124_1767120447756.jpg";
import friendsInCity from "@assets/IMG_1274_1767120447754.jpg";
import youthOnStreet from "@assets/IMG_1293_1767120447755.jpg";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: heroImage,
    alt: "Western Wall and Dome of the Rock at sunset",
    caption: "The iconic view of the Western Wall with the golden Dome of the Rock",
    featured: true
  },
  {
    src: westernWall,
    alt: "The Western Wall",
    caption: "The Western Wall - a sacred place of prayer and reflection",
    featured: true
  },
  {
    src: domeOfRock,
    alt: "Dome of the Rock from Mount of Olives",
    caption: "The golden dome rising above the ancient city walls"
  },
  {
    src: cityView,
    alt: "Jerusalem skyline",
    caption: "A panoramic view of Jerusalem's timeless landscape"
  },
  {
    src: templeMountArea,
    alt: "Temple Mount area at dusk",
    caption: "Ancient walls bathed in the golden light of dusk"
  },
  {
    src: mountOfOlives,
    alt: "Mount of Olives cemetery",
    caption: "The ancient Jewish cemetery on the Mount of Olives"
  },
  {
    src: israelFlags,
    alt: "Israeli flags over Jerusalem",
    caption: "Flags waving over the rooftops of the Old City"
  },
  {
    src: gardenTomb,
    alt: "The Garden Tomb",
    caption: "The Garden Tomb - a place of peaceful reflection"
  },
  {
    src: streetLife,
    alt: "Street life in Jerusalem",
    caption: "Young people gathering at a public piano in the city center"
  },
  {
    src: hostagePosters,
    alt: "Bring Them Home posters",
    caption: "Reminders of those still held captive - a call to prayer"
  },
  {
    src: cafeBreak,
    alt: "Cafe break in Jerusalem",
    caption: "Sharing a meal and fellowship in the heart of the city"
  },
  {
    src: localDriver,
    alt: "Our local guide",
    caption: "A warm welcome from our local driver and friend"
  },
  {
    src: friendsInCity,
    alt: "Friends overlooking Jerusalem",
    caption: "Brotherhood and fellowship with a view of the Holy City"
  },
  {
    src: youthOnStreet,
    alt: "Youth on the streets of Jerusalem",
    caption: "Everyday moments of connection on Jerusalem's ancient stones"
  }
];

export default function MissionJerusalem() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Jerusalem - Western Wall and Dome of the Rock"
          className="w-full h-full object-cover"
          data-testid="hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <Link href="/#missions">
            <Button variant="ghost" className="text-white mb-4 hover:bg-white/20" data-testid="back-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Missions
            </Button>
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white font-bold" data-testid="mission-title">
            Jerusalem, Israel
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <section className="max-w-4xl mx-auto mb-16" data-testid="about-section">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
            About This Mission
          </h2>
          <div className="prose prose-lg text-muted-foreground space-y-4">
            <p>
              We arrived in Jerusalem as the ceasefire with Iran began, on the very day of a bus shooting, and during the height of the war in Gaza. The news painted a picture of chaos and danger, yet what we found on the ground told a different story.
            </p>
            <p>
              In the midst of sirens and uncertainty, we discovered a city of profound beauty and unexpected peace. Walking the ancient stones where prophets once walked, praying at the Western Wall where millions have poured out their hearts, and standing in the Garden Tomb where resurrection hope was born - we experienced the presence of God in ways that transcended the headlines.
            </p>
            <p>
              We met resilient people carrying on with daily life, sharing meals, making music on street pianos, and extending hospitality to strangers. We saw the "Bring Them Home" posters - reminders to pray for those still in captivity. We witnessed a nation under pressure but not without hope.
            </p>
            <p>
              Jerusalem taught us that peace isn't the absence of conflict - it's the presence of faith that carries you through. In this ancient city where three faiths converge, where history and eternity meet, we found that the Prince of Peace still walks these streets, inviting all who come to find rest for their souls.
            </p>
          </div>
        </section>

        <section data-testid="gallery-section">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Photo Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-lg shadow-md ${
                  image.featured ? "col-span-2 row-span-2" : ""
                }`}
                data-testid={`gallery-item-${index}`}
              >
                <div className={`relative ${image.featured ? "aspect-square" : "aspect-square"}`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-testid={`gallery-image-${index}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs md:text-sm font-medium">{image.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
