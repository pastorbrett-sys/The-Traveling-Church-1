import redSeaImage from "@assets/Red-Sea_1760165635786.jpg";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative h-screen max-h-[600px] min-h-[400px] flex items-center justify-center overflow-hidden"
    >
      <img
        src={redSeaImage}
        alt="Red Sea beach with thatched shelter"
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="img-hero"
      />
      <div className="hero-overlay absolute inset-0"></div>
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 
          className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          data-testid="text-hero-title"
        >
          The Traveling Church
        </h1>
        <p 
          className="text-lg md:text-xl text-white/95 leading-relaxed font-light"
          data-testid="text-hero-mission"
        >
          A global, traveling ministry, comprised of people all over the world. We reach out to people where they are to spread the gospel and love of Jesus. Our goal is to create the largest and most powerful spiritual revival on planet Earth.
        </p>
      </div>
    </section>
  );
}
