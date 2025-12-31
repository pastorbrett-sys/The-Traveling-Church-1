import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroImage from "@assets/__Red_Sea_1767124933007.jpg";
import egyptMoney from "@assets/IMG_0743_1767124933006.jpg";
import mealPrep from "@assets/IMG_0746_1767124933006.JPG?url";
import mealsCrate from "@assets/IMG_0747_1767124933006.JPG?url";
import goatView from "@assets/IMG_0785_1767124933006.jpg";
import blueDoors from "@assets/IMG_0831_1767124933007.jpg";
import nightSelfie from "@assets/IMG_0910_1767124933007.jpg";
import bibleRoom from "@assets/IMG_0316(1)_1767124933007.jpg";
import motorcycleRiders from "@assets/IMG_0370_1767124933008.jpg";
import tukTuk from "@assets/IMG_0379_1767124933008.jpg";
import streetVendors from "@assets/IMG_0420_1767124933008.jpg";
import alleyWalk from "@assets/IMG_0427_1767124933008.jpg";
import nightMarket from "@assets/IMG_0443(1)_1767124933008.jpg";
import nightStreet from "@assets/IMG_0445_1767124933009.jpg";
import checkpoint from "@assets/IMG_0530_1767124933009.jpg";
import camelGuide from "@assets/IMG_0630_1767124933009.jpg";
import camelFace from "@assets/IMG_0631_1767124933009.jpg";
import tireKids from "@assets/IMG_0652_1767124933010.jpg";
import localMeeting from "@assets/IMG_0680_1767124933010.jpg";
import caveSelfie from "@assets/IMG_0729_1767124933010.jpg";

import video1 from "@assets/egypt_street_compressed.mp4";
import video2 from "@assets/egypt_sinai_compressed.mp4";
import video3 from "@assets/egypt_v3_compressed.mp4";
import video4 from "@assets/IMG_0311_1767125302509.MOV?url";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: heroImage,
    alt: "Red Sea beach in Egypt",
    caption: "The beautiful shores of the Red Sea - where Moses led the Israelites to freedom",
    featured: true
  },
  {
    src: camelGuide,
    alt: "Camel guide in the Sinai mountains",
    caption: "Meeting the Bedouin guides near Mount Sinai",
    featured: true
  },
  {
    src: caveSelfie,
    alt: "Friends in an ancient cave",
    caption: "Exploring ancient caves with new friends"
  },
  {
    src: camelFace,
    alt: "Camel in the Sinai desert",
    caption: "Our trusty companion on the journey through the Sinai"
  },
  {
    src: nightSelfie,
    alt: "Night out in Egypt",
    caption: "Evening fellowship on the streets of Egypt"
  },
  {
    src: tireKids,
    alt: "Children playing near tires",
    caption: "The joy of children in the Sinai region"
  },
  {
    src: mealPrep,
    alt: "Meal preparation for the community",
    caption: "Preparing meals to feed those in need"
  },
  {
    src: mealsCrate,
    alt: "Packaged meals ready for distribution",
    caption: "Each meal represents God's provision and love"
  },
  {
    src: blueDoors,
    alt: "Beautiful blue doors in Egyptian home",
    caption: "Traditional craftsmanship adorns our humble accommodations"
  },
  {
    src: bibleRoom,
    alt: "Bible open in Egyptian room",
    caption: "Morning devotions with the Book of Job - finding wisdom in every place"
  },
  {
    src: alleyWalk,
    alt: "Walking through Cairo alleyway",
    caption: "Walking through the historic streets where faith has endured for millennia"
  },
  {
    src: nightMarket,
    alt: "Night market in Egypt",
    caption: "The vibrant night markets of Egypt - where life continues after dark"
  },
  {
    src: nightStreet,
    alt: "Evening street scene",
    caption: "Local life on the streets of Egypt at dusk"
  },
  {
    src: streetVendors,
    alt: "Street vendors under overpass",
    caption: "Daily life continues under Cairo's modern infrastructure"
  },
  {
    src: tukTuk,
    alt: "Tuk-tuk on Egyptian street",
    caption: "The heartbeat of Egyptian transportation - tuk-tuks everywhere"
  },
  {
    src: motorcycleRiders,
    alt: "Locals on motorcycle",
    caption: "Life moves at its own pace in the Egyptian countryside"
  },
  {
    src: localMeeting,
    alt: "Meeting with local community",
    caption: "Building relationships with the local community"
  },
  {
    src: goatView,
    alt: "View from Egyptian accommodation",
    caption: "Our morning view - complete with friendly neighbors"
  },
  {
    src: checkpoint,
    alt: "Driving through checkpoint",
    caption: "Crossing through security checkpoints on our journey"
  },
  {
    src: egyptMoney,
    alt: "Egyptian currency",
    caption: "Preparing resources for our mission work"
  }
];

interface GalleryVideo {
  src: string;
  caption: string;
  vertical?: boolean;
}

const galleryVideos: GalleryVideo[] = [
  {
    src: video1,
    caption: "Walking through the streets of Egypt",
    vertical: true
  },
  {
    src: video2,
    caption: "Life in the Sinai region",
    vertical: true
  },
  {
    src: video3,
    caption: "Preparing meals for those in need",
    vertical: true
  },
  {
    src: video4,
    caption: "Morning in Egypt",
    vertical: true
  }
];

export default function MissionEgypt() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Egypt Mission | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Red Sea coast in Egypt"
            className="w-full h-full object-cover"
            data-testid="img-egypt-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Egypt</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-egypt-title"
              >
                Egypt Mission
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Following the path of the Holy Family
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
                Egypt holds a special place in biblical history. From the story of Joseph to the Exodus, 
                from the Holy Family's flight to Egypt to the early Coptic Church, this ancient land has 
                been woven into God's redemptive story for thousands of years.
              </p>
              <p>
                Our mission took us from the bustling streets of Cairo to the serene shores of the Red Sea, 
                and into the rugged mountains of the Sinai Peninsula. We walked where Moses received the 
                Ten Commandments, served communities in need, and shared fellowship with Egyptian believers 
                whose faith has endured through centuries of challenges.
              </p>
              <p>
                From preparing meals for those in need to exploring ancient sites of biblical significance, 
                every moment reminded us that God's story continues to unfold in this remarkable land. The 
                warmth of the Egyptian people and the depth of their hospitality reflected the love of Christ 
                in ways words cannot capture.
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
