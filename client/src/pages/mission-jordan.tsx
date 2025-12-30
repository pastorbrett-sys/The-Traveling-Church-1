import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import embraceImage from "@assets/IMG_1159_1767129664291.JPG?url";
import heroImage from "@assets/IMG_1160_1767129664288.JPG?url";
import baptismQuiet from "@assets/IMG_1161_1767129664288.JPG?url";
import baptismCelebration from "@assets/IMG_1162_1767129664288.JPG?url";
import riverView from "@assets/WhatsApp_Image_2025-12-30_at_4.09.02_PM_1767129664289.jpeg";
import baptismSite from "@assets/fasdfa_1767129664289.jpeg";
import pastorInRiver from "@assets/asfdasfa_1767129664290.jpeg";
import riverReeds from "@assets/fasd_1767129664290.jpeg";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: heroImage,
    alt: "Reaching hands during baptism",
    caption: "The sacred moment of baptism - reaching out in faith in the Jordan River",
    featured: true
  },
  {
    src: embraceImage,
    alt: "Embrace after baptism in the Jordan River",
    caption: "A moment of pure joy and spiritual rebirth - embracing after baptism in the same waters where Jesus was baptized",
    featured: true
  },
  {
    src: baptismCelebration,
    alt: "Celebration after baptism",
    caption: "Pastor Brett and a new brother in Christ celebrating the moment of baptism"
  },
  {
    src: baptismQuiet,
    alt: "Quiet moment before baptism",
    caption: "A moment of prayer and reflection before going under the waters"
  },
  {
    src: pastorInRiver,
    alt: "Pastor Brett in the Jordan River",
    caption: "Pastor Brett standing in the sacred waters at the baptism site, with the church visible on the Jordanian side"
  },
  {
    src: baptismSite,
    alt: "The baptism site at the Jordan River",
    caption: "Qasr el Yahud - the traditional site where Jesus was baptized by John the Baptist"
  },
  {
    src: riverView,
    alt: "View of the Jordan River",
    caption: "The peaceful waters of the Jordan River, unchanged for thousands of years"
  },
  {
    src: riverReeds,
    alt: "Jordan River with reeds",
    caption: "The gentle flow of the Jordan, lined with reeds as in Biblical times"
  }
];

export default function MissionJordan() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Baptism at the Jordan River | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Reaching hands during baptism in the Jordan River"
            className="w-full h-full object-cover"
            data-testid="img-jordan-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Jordan River, Israel</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-jordan-title"
              >
                Baptism at the Jordan River
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Where Jesus was baptized by John the Baptist
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
                There is no place on Earth quite like the Jordan River. This is where Jesus 
                Himself was baptized by John the Baptist, marking the beginning of His earthly 
                ministry. When we bring believers to be baptized in these same waters, we're 
                connecting them to over 2,000 years of Christian faith and tradition.
              </p>
              <p>
                At Qasr el Yahud, the traditional baptism site on the Israeli side of the Jordan, 
                Pastor Brett has had the profound privilege of baptizing believers from around the 
                world. Standing in the muddy waters of the Jordan - unchanged since Biblical times - 
                there's an overwhelming sense of the sacred. You can look across to Jordan on the 
                other side, see the ancient church marking the spot, and feel the weight of history 
                and faith converging.
              </p>
              <p>
                Each baptism here is deeply personal yet universally significant. As believers go 
                under the water and rise again, they're following in the footsteps of Jesus Himself. 
                The joy, the tears, the embraces that follow - these are moments that change lives 
                forever. This is why The Traveling Church exists: to help people experience their 
                faith in the very places where it all began.
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
