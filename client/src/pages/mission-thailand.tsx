import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroImage from "@assets/29A7ED8A-129F-4983-AB5E-5D32A7EBD688_1767128055581.JPG?url";
import elephantLegs from "@assets/IMG_5021_1767128055582.jpg";
import elephantMeeting from "@assets/IMG_5028_1767128055582.jpg";
import rainbowLake from "@assets/IMG_0079_1767128055581.jpg";
import dockView from "@assets/IMG_0093_1767128055581.jpg";
import floatingHouses from "@assets/IMG_0096_1767128055582.jpg";
import jungleHut from "@assets/IMG_9953_1767128055581.jpg";
import islandPanorama from "@assets/IMG_9838_1767128055583.jpg";
import boatRide from "@assets/IMG_9922_1767128055583.jpg";
import rockFormations from "@assets/IMG_9923_1767128055584.jpg";
import jungleFloating from "@assets/IMG_9938_1767128055584.jpg";
import bambooRaft from "@assets/IMG_9949_1767128055585.jpg";

import video1 from "@assets/IMG_0110_1767130315169.MOV?url";
import video2 from "@assets/IMG_5046_1767130079431.MOV?url";
import video3 from "@assets/thailand_video2_compressed.mp4";
import video4 from "@assets/IMG_5067_1767130079430.MOV?url";
import video5 from "@assets/IMG_5071_1767130523133.MOV?url";
import video6 from "@assets/thailand_video3_compressed.mp4";
import video7 from "@assets/thailand_video1_compressed.mp4";
import video8 from "@assets/IMG_5949_1767130523133.MOV?url";

const videos = [
  { src: video1, title: "Elephant in Transport" },
  { src: video2, title: "Elephant Sanctuary Visit" },
  { src: video3, title: "Feeding the Elephants" },
  { src: video4, title: "Elephants at Play" },
  { src: video5, title: "Meeting the Elephants" },
  { src: video6, title: "Walking with Giants" },
  { src: video7, title: "Sanctuary Moments" },
  { src: video8, title: "Conservation in Action" }
];

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: heroImage,
    alt: "Pastor Brett with rescued elephants",
    caption: "Pastor Brett with our gentle giants at the elephant sanctuary - we love elephants!",
    featured: true
  },
  {
    src: elephantMeeting,
    alt: "Close encounter with an elephant",
    caption: "A peaceful moment connecting with one of the sanctuary's rescued elephants",
    featured: true
  },
  {
    src: elephantLegs,
    alt: "Elephant at the sanctuary",
    caption: "These magnificent creatures roam freely at the ethical sanctuary"
  },
  {
    src: rockFormations,
    alt: "Limestone rock formations in the lake",
    caption: "The stunning limestone karsts of Khao Sok - God's natural cathedral"
  },
  {
    src: rainbowLake,
    alt: "Rainbow over the lake",
    caption: "A rainbow blessing over the pristine waters - a reminder of God's promises"
  },
  {
    src: floatingHouses,
    alt: "Floating houses at dusk",
    caption: "Floating bungalows nestled among the limestone mountains"
  },
  {
    src: boatRide,
    alt: "Boat ride through the national park",
    caption: "Exploring the hidden waterways of Khao Sok National Park"
  },
  {
    src: bambooRaft,
    alt: "Bamboo raft journey",
    caption: "Traditional bamboo raft ride to remote jungle communities"
  },
  {
    src: jungleHut,
    alt: "Jungle hut by the water",
    caption: "Simple living along the emerald waters of southern Thailand"
  },
  {
    src: jungleFloating,
    alt: "View of floating village through jungle",
    caption: "Floating village glimpsed through the lush jungle canopy"
  },
  {
    src: dockView,
    alt: "Relaxing view from the dock",
    caption: "Finding peace and reflection in Thailand's natural beauty"
  },
    {
    src: islandPanorama,
    alt: "Panoramic view of islands",
    caption: "The breathtaking islands of Phang Nga Bay"
  }
];

export default function MissionThailand() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Animal Conservation in Thailand | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Pastor Brett with elephants at sanctuary"
            className="w-full h-full object-cover"
            data-testid="img-thailand-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Thailand</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-thailand-title"
              >
                Animal Conservation in Thailand
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Caring for God's magnificent creatures at elephant sanctuaries
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
                We love elephants! Thailand's majestic elephants hold a special place in our hearts, 
                and our conservation mission takes us to ethical sanctuaries where rescued elephants 
                find healing and freedom. These gentle giants, once exploited for tourism or logging, 
                now live in peace under the care of dedicated conservationists.
              </p>
              <p>
                Our time in Thailand extends beyond the elephant sanctuaries into the pristine 
                wilderness of Khao Sok National Park - one of the world's oldest rainforests. 
                Floating among limestone karsts that rise dramatically from emerald waters, we're 
                reminded of the incredible beauty of God's creation and our responsibility to 
                protect it.
              </p>
              <p>
                From bamboo raft journeys to remote villages to quiet moments of reflection on 
                floating bungalows, Thailand teaches us about living in harmony with nature. 
                Supporting animal conservation is an extension of our faith - caring for the 
                creatures God has entrusted to us and the communities that protect them.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" data-testid="heading-videos">
              Videos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="relative" data-testid={`video-item-${index}`}>
                  <video
                    src={video.src}
                    controls
                    preload="metadata"
                    className="w-full aspect-[9/16] object-cover rounded-lg shadow-md bg-black"
                    data-testid={`video-${index}`}
                  />
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
                      data-testid={`img-gallery-${index}`}
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
