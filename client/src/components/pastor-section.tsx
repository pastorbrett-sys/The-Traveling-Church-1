import { SiInstagram, SiTiktok } from "react-icons/si";

export default function PastorSection() {
  const pastorImage = "/public-objects/Pastor Brett_1760674999817.png";
  return (
    <section id="pastor" className="py-12 md:py-16 px-4 bg-muted">
      <div className="max-w-4xl mx-auto">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-primary mb-8 text-center"
          data-testid="text-pastor-title"
        >
          Meet Pastor Brett
        </h2>

        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <div className="md:flex">
            <div className="md:w-2/5">
              <img
                src={pastorImage}
                alt="Pastor Brett"
                className="w-full h-64 md:h-full object-cover"
                data-testid="img-pastor"
                loading="lazy"
              />
            </div>
            <div className="p-6 md:p-8 md:w-3/5 flex flex-col">
              <h3 
                className="text-xl md:text-2xl font-semibold text-foreground mb-4"
                data-testid="text-pastor-subtitle"
              >
                A Journey of Faith and Service
              </h3>
              <div 
                className="space-y-4 text-muted-foreground leading-relaxed flex-grow"
                data-testid="text-pastor-biography"
              >
                <p>
                  Pastor Brett didn't start his ministry in a seminary or traditional church. His calling came on the road, traveling through different communities and witnessing firsthand the hunger for authentic spiritual connection in our modern world.
                </p>
                <p>
                  Inspired by the early apostles who walked from town to town, Pastor Brett left behind the comforts of conventional ministry to become a traveling messenger of God's love. His mission is simple: meet people where they are, share the gospel without judgment, and build a global community united by faith and compassion.
                </p>
                <p className="text-secondary font-medium">
                  "We don't need fancy robes or grand cathedrals. We need open hearts and willing hands. Come as you are, and let the Spirit do the rest."
                </p>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                <a
                  href="https://www.instagram.com/the_bcuz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-pink-500 transition-colors"
                  data-testid="link-pastor-instagram"
                  aria-label="Follow Pastor Brett on Instagram"
                >
                  <SiInstagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@pastorbrett"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-pastor-tiktok"
                  aria-label="Follow Pastor Brett on TikTok"
                >
                  <SiTiktok className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
