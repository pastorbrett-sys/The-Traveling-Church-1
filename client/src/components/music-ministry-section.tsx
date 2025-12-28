import edmBanner from "@assets/EDM_BANNER_1_1766962031883.png";

export default function MusicMinistrySection() {
  return (
    <section id="music" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4" data-testid="heading-music-ministry">
          Global Music Ministry
        </h2>

        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto" data-testid="text-music-description">
          Experience worship through electronic music. Our Global Music Ministry brings faith to life through sound, 
          streaming continuously to believers around the world.
        </p>

        <div className="relative overflow-hidden rounded-2xl shadow-2xl max-w-3xl mx-auto">
          <img
            src={edmBanner}
            alt="After The Fire - Electronic Music Ministry"
            className="w-full h-auto object-cover"
            data-testid="img-music-banner"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
