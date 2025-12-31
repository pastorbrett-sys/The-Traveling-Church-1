import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import heroImage from "@assets/IMG_5162_1767126443573.jpg";
import saiPortrait from "@assets/Sai_and_his_family_made_delicious_spicy_banana_chips,_we_decid_1767126749785.jpg";
import saiFamily from "@assets/555fa120-a4ec-4871-8819-820a4d27f061_1767126623920.jpg";
import teachingWhiteboard from "@assets/IMG_5178_1767126443572.jpg";
import laughingDuo from "@assets/IMG_5165_1767126443573.jpg";
import holdingCard from "@assets/IMG_5166_1767126443573.jpg";
import classroomView from "@assets/IMG_5168_1767126443573.jpg";
import teachingBook from "@assets/IMG_5169_1767126443574.jpg";
import holdingFlashcard from "@assets/IMG_5170_1767126443574.jpg";
import childrenCloseup from "@assets/IMG_5979_1767126453202.jpg";
import trailSelfie from "@assets/IMG_5900_1767126453203.jpg";
import villageWater from "@assets/IMG_5693_1767126453203.jpg";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
}

const galleryImages: GalleryImage[] = [
  {
    src: saiPortrait,
    alt: "Sai smiling by the water",
    caption: "Meet Sai - we provided the seed investment to help him start his banana chip business",
    featured: true
  },
  {
    src: saiFamily,
    alt: "Sai with his family celebrating",
    caption: "Sai and his family celebrating - his banana chip business is thriving",
    featured: true
  },
  {
    src: heroImage,
    alt: "Teaching children in a Cambodian classroom",
    caption: "Pastor Brett sharing knowledge with the children of Cambodia",
    featured: true
  },
  {
    src: villageWater,
    alt: "Cambodian village by the water",
    caption: "The communities we serve - life along the waterways of Cambodia",
    featured: true
  },
  {
    src: teachingWhiteboard,
    alt: "Teaching at the whiteboard",
    caption: "Teaching English to eager young learners"
  },
  {
    src: laughingDuo,
    alt: "Sharing a laugh with local teacher",
    caption: "Building friendships and partnerships with local educators"
  },
  {
    src: holdingCard,
    alt: "Teaching with flashcards",
    caption: "Using visual aids to help children learn"
  },
  {
    src: classroomView,
    alt: "Classroom full of students",
    caption: "A classroom full of bright minds ready to learn"
  },
  {
    src: teachingBook,
    alt: "Reading to the class",
    caption: "Sharing stories and lessons with the students"
  },
  {
    src: holdingFlashcard,
    alt: "Interactive teaching session",
    caption: "Interactive learning keeps the children engaged"
  },
  {
    src: childrenCloseup,
    alt: "Cambodian school children",
    caption: "The beautiful faces of Cambodia's next generation"
  },
  {
    src: trailSelfie,
    alt: "Friends on the trail",
    caption: "Traveling to remote villages with new friends"
  }
];

export default function MissionCambodia() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Cambodia Mission | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pb-16">
        <div className="relative h-[50vh] min-h-[300px] max-h-[500px]">
          <img
            src={heroImage}
            alt="Classroom in Cambodia"
            className="w-full h-full object-cover"
            data-testid="img-cambodia-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Cambodia</span>
              </div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                data-testid="heading-cambodia-title"
              >
                Cambodia Mission
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                Ministering to communities rising from hardship
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
                Cambodia carries the weight of a painful past, yet its people radiate hope and 
                resilience that speaks to the human spirit's capacity for renewal. Our mission 
                took us deep into rural communities where education is a precious gift and 
                every child's smile tells a story of perseverance.
              </p>
              <p>
                Working alongside local teachers and community leaders, we spent our days in 
                village schools teaching English, sharing stories, and building relationships 
                that transcend language barriers. The children's eagerness to learn and their 
                joy in simple moments reminded us why this work matters so deeply.
              </p>
              <p>
                From the stilted houses along the waterways to the dusty trails leading to 
                remote villages, Cambodia opened our hearts to a new understanding of faith 
                in action. The warmth of the Cambodian people and their generous hospitality 
                left an indelible mark on our ministry.
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
