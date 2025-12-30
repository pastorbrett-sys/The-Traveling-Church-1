import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroImage from "@assets/Red-Sea_1760165635786.jpg";
import caveSelfie from "@assets/IMG_0729_1767124280487.jpg";
import foodTrays from "@assets/IMG_0746_1767124280488.JPG?url";
import foodCrate from "@assets/IMG_0747_1767124280489.JPG?url";
import egyptLocation from "@assets/Egypt_1760679346019.jpg";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: foodTrays,
    alt: "Prepared food trays for street distribution",
    caption: "Preparing meals to share with those in need on the streets of Cairo",
    featured: true
  },
  {
    src: foodCrate,
    alt: "Food packages ready for distribution",
    caption: "Each meal package represents God's love shared through a simple act of kindness",
    featured: true
  },
  {
    src: caveSelfie,
    alt: "Pastor Brett with friend in ancient cave",
    caption: "Exploring the ancient sites where early Christians once gathered"
  },
  {
    src: egyptLocation,
    alt: "Egypt landscape",
    caption: "The land where Moses led his people to freedom"
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
            alt="Red Sea coastline in Egypt"
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
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" data-testid="heading-about">
              About This Mission
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                Egypt holds a sacred place in biblical history. From the story of Joseph and the Exodus 
                to the Holy Family's flight from Herod, this ancient land has been woven into God's 
                story of redemption for thousands of years.
              </p>
              <p>
                Our mission to Egypt took us through the bustling streets of Cairo where we prepared 
                and distributed food to those in need. Each meal was more than nourishment - it was 
                an opportunity to share Christ's love through action, meeting people where they are 
                and serving them as Jesus served.
              </p>
              <p>
                Walking the same ground where Moses led his people to freedom, exploring ancient sites 
                where the early church once gathered, and seeing the Red Sea where God made a way - 
                Egypt reminded us that our faith is rooted in real history and a God who shows up in 
                the most unexpected places.
              </p>
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
