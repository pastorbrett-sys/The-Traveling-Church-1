import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import originalHeroImage from "@assets/IMG_2260_1767118533609.jpg";
import heroImage from "@assets/generated_images/lalibela_rock_church_ethiopia.png";
import churchPool from "@assets/IMG_2171_1767118533608.jpg";
import rockStructures from "@assets/IMG_2191_1767118533608.jpg";
import nightCross from "@assets/IMG_2069_1767118533608.jpg";
import marketScene from "@assets/5228A59C-AE32-4FB3-A509-8735BC11FBC1_1767118533609.jpg";
import childrenBible from "@assets/IMG_1720_1767118533609.jpg";
import pastorFriends from "@assets/IMG_1620_1767118533609.jpg";
import volcanoSelfie from "@assets/IMG_1791_1767118533610.jpg";
import teamVehicle from "@assets/IMG_1933_1767118533607.jpg";
import vehicleRoof from "@assets/IMG_1948_1767118533608.jpg";
import localGuide from "@assets/IMG_1756_1767118533610.jpg";
import nightCooking from "@assets/IMG_1767_1767118533610.jpg";
import expeditionTeam from "@assets/IMG_1843_1767118533610.jpg";

import video1 from "@assets/ethiopia_v1_compressed.mp4";
import video2 from "@assets/ethiopia_v2_compressed.mp4";
import video3 from "@assets/ethiopia_v3_compressed.mp4";
import video4 from "@assets/ethiopia_danakil_compressed.mp4";
import video5 from "@assets/ethiopia_v5_compressed.mp4";
import video6 from "@assets/ethiopia_v6_compressed.mp4";
import video7 from "@assets/ethiopia_churches_compressed.mp4";
import video8 from "@assets/ethiopia_v8_compressed.mp4";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: childrenBible,
    alt: "Ethiopian children reading the Bible",
    caption: "One of the highlights of the trip was sitting and reading the Bible with a group of Muslim boys.",
    featured: true
  },
  {
    src: churchPool,
    alt: "Ancient rock-hewn church with baptismal pool",
    caption: "One of Lalibela's ancient rock-hewn churches with its sacred baptismal pool",
    featured: true
  },
  {
    src: nightCross,
    alt: "Illuminated cross overlooking Ethiopian city at night",
    caption: "A glowing cross stands watch over the city - a testament to Ethiopia's deep Christian heritage"
  },
  {
    src: pastorFriends,
    alt: "Pastor Brett with Ethiopian friends",
    caption: "Building lasting friendships with our Ethiopian brothers"
  },
  {
    src: rockStructures,
    alt: "Ancient rock structures in Lalibela",
    caption: "The remarkable carved rock dwellings where faith has endured for centuries"
  },
  {
    src: marketScene,
    alt: "Bustling Ethiopian market with mountain backdrop",
    caption: "A vibrant local market nestled in the Ethiopian highlands"
  },
  {
    src: volcanoSelfie,
    alt: "Pastor Brett at volcanic region",
    caption: "Exploring the Danakil Depression - one of Earth's most extreme environments"
  },
  {
    src: teamVehicle,
    alt: "Mission team with vehicle in salt flats",
    caption: "Our team crossing the vast salt flats of the Afar region"
  },
  {
    src: expeditionTeam,
    alt: "Expedition vehicles on volcanic terrain",
    caption: "The journey takes us through incredible volcanic landscapes"
  },
  {
    src: localGuide,
    alt: "Local guide on vehicle roof",
    caption: "Our Afar guide navigating through remote territories"
  },
  {
    src: vehicleRoof,
    alt: "Traveling across the desert",
    caption: "Capturing the endless beauty of Ethiopia's remote regions"
  },
  {
    src: nightCooking,
    alt: "Preparing meals in traditional setting",
    caption: "Sharing meals prepared in a traditional Afar dwelling"
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
    caption: "Exploring the ancient rock-hewn churches of Lalibela",
    vertical: true
  },
  {
    src: video2,
    caption: "Walking through sacred grounds",
    vertical: true
  },
  {
    src: video3,
    caption: "The stunning landscapes of Ethiopia",
    vertical: true
  },
  {
    src: video4,
    caption: "Journey through the Danakil Depression",
    vertical: false
  },
  {
    src: video5,
    caption: "Moments from our Ethiopian journey",
    vertical: true
  },
  {
    src: video6,
    caption: "Life in the Afar region",
    vertical: true
  },
  {
    src: video7,
    caption: "Inside the ancient churches",
    vertical: true
  },
  {
    src: video8,
    caption: "Sacred traditions preserved through centuries",
    vertical: true
  }
];

export default function MissionEthiopia() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Ethiopia Mission | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Rock-hewn church in Lalibela, Ethiopia"
            className="w-full h-full object-cover"
            data-testid="img-ethiopia-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Ethiopia</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-ethiopia-title"
              >
                Ethiopia Mission
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                In the cradle of ancient Christianity
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
                Ethiopia holds a unique place in Christian history. As one of the first nations to embrace 
                Christianity, its faith traditions stretch back nearly 2,000 years. The ancient rock-hewn 
                churches of Lalibela, carved from solid stone in the 12th century, stand as monuments to 
                a faith that has endured through centuries.
              </p>
              <p>
                Our mission to Ethiopia took us from the highlands of Lalibela to the extreme landscapes 
                of the Danakil Depression - one of the hottest and most inhospitable places on Earth. 
                Along the way, we connected with believers whose ancestors have kept the faith through 
                generations, shared the Gospel with those we met, and witnessed God's hand in every 
                encounter.
              </p>
              <p>
                From children eagerly reading Scripture to ancient churches still holding services after 
                800 years, Ethiopia reminded us that the message of Christ transcends time, culture, and 
                geography. This is what it means to be a traveling church - going where God leads and 
                finding His family already there.
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
