import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroImage from "@assets/generated_images/jerusalem_western_wall_sunset_view.png";

import soldierVideo from "@assets/soldier_1767121798377.mp4?url";
import video1 from "@assets/jerusalem_v1_compressed.mp4";
import video2 from "@assets/jerusalem_v2_compressed.mp4";
import video3 from "@assets/jerusalem_v3_compressed.mp4";
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

interface GalleryVideo {
  src: string;
  caption: string;
  vertical?: boolean;
}

const galleryVideos: GalleryVideo[] = [
  {
    src: soldierVideo,
    caption: "Inside a war zone - witnessing what few are allowed to see",
    vertical: true
  },
  {
    src: video1,
    caption: "Moments from the streets of Jerusalem",
    vertical: true
  },
  {
    src: video2,
    caption: "Life continues in the Holy City",
    vertical: true
  },
  {
    src: video3,
    caption: "Walking the ancient paths",
    vertical: true
  }
];

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
    src: localDriver,
    alt: "Palestinian Christian friend",
    caption: "Meeting with the Palestinian Christian that baptized our Pastor"
  },
  {
    src: domeOfRock,
    alt: "Dome of the Rock from Mount of Olives",
    caption: "The golden dome rising above the ancient city walls"
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
    src: friendsInCity,
    alt: "Friends overlooking Jerusalem",
    caption: "Brotherhood and fellowship with a view of the Holy City"
  },
  {
    src: youthOnStreet,
    alt: "Youth on the streets of Jerusalem",
    caption: "Everyday moments of connection on Jerusalem's ancient stones"
  },
  {
    src: cityView,
    alt: "Jerusalem skyline",
    caption: "A panoramic view of Jerusalem's timeless landscape"
  }
];

export default function MissionJerusalem() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Israel | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Western Wall and Dome of the Rock in Jerusalem"
            className="w-full h-full object-cover"
            data-testid="img-jerusalem-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Israel</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-jerusalem-title"
              >
                Israel
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Walking the holy streets where history and eternity meet
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
          <Link
            href="/missions"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-missions"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Missions
          </Link>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" data-testid="heading-about">
              About This Mission
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                We arrived in Jerusalem as the ceasefire with Iran began, on the very day of a bus shooting, 
                and during the height of the war in Gaza. The news painted a picture of chaos and danger, 
                yet what we found on the ground told a different story.
              </p>
              <p>
                In the midst of sirens and uncertainty, we discovered a city of profound beauty and 
                unexpected peace. Walking the ancient stones where prophets once walked, praying at the 
                Western Wall where millions have poured out their hearts, and standing in the Garden Tomb 
                where resurrection hope was born - we experienced the presence of God in ways that 
                transcended the headlines.
              </p>
              <p>
                We met resilient people carrying on with daily life, sharing meals, making music on street 
                pianos, and extending hospitality to strangers. We saw the "Bring Them Home" posters - 
                reminders to pray for those still in captivity. We witnessed a nation under pressure but 
                not without hope.
              </p>
              <p>
                Jerusalem taught us that peace isn't the absence of conflict - it's the presence of faith 
                that carries you through. In this ancient city where three faiths converge, where history 
                and eternity meet, we found that the Prince of Peace still walks these streets, inviting 
                all who come to find rest for their souls.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" data-testid="heading-videos">
              Videos
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryVideos.map((video, index) => (
                <div 
                  key={index}
                  className="overflow-hidden rounded-lg shadow-md bg-card"
                  data-testid={`video-item-${index}`}
                >
                  <div className="relative aspect-[9/16]">
                    <video
                      src={video.src}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover bg-black"
                      data-testid={`video-${index}`}
                    />
                  </div>
                  <div className="p-3 bg-card">
                    <p className="text-xs text-muted-foreground">{video.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6" data-testid="heading-gallery">
              Photo Gallery
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {galleryImages.map((image, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-lg shadow-md bg-card ${
                    image.featured ? 'md:col-span-2' : ''
                  }`}
                  data-testid={`gallery-item-${index}`}
                >
                  <div className={`relative ${image.featured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-sm text-muted-foreground">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
