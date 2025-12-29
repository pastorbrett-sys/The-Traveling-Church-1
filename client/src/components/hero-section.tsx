import { useEffect, useRef } from "react";
import heroVideo from "@assets/Man_on_Mountain_Spinning_Fast_1_1766872397132.mp4";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleParts = ["The Traveling", "Church"];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Play on any user interaction (mobile workaround for Low Power Mode)
    const playOnInteraction = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('touchstart', playOnInteraction, { once: true });
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('scroll', playOnInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('scroll', playOnInteraction);
    };
  }, []);
  
  const animateTitle = () => {
    let charIndex = 0;
    
    return titleParts.map((part, partIndex) => (
      <span key={partIndex} className="block">
        {part.split("").map((char, index) => {
          const currentDelay = charIndex * 0.05;
          charIndex++;
          return (
            <span
              key={index}
              className="inline-block animate-fade-in opacity-0"
              style={{
                animationDelay: `${currentDelay}s`,
                animationFillMode: 'forwards'
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <section
      id="home"
      className="relative h-screen max-h-[600px] min-h-[400px] flex items-center justify-center overflow-hidden"
    >
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-hero"
      />
      <div className="hero-overlay absolute inset-0"></div>
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto -mt-[50px] md:mt-0">
        <h1 
          className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          data-testid="text-hero-title"
        >
          {animateTitle()}
        </h1>
        <p 
          className="text-lg md:text-xl text-white/95 leading-relaxed font-light animate-fade-up opacity-0"
          style={{
            animationDelay: '1s',
            animationFillMode: 'forwards'
          }}
          data-testid="text-hero-mission"
        >
          A global, traveling ministry, comprised of people all over the world. We reach out to people where they are to spread the gospel and love of Jesus. Our goal is to create the largest and most powerful spiritual revival on planet Earth.
        </p>
      </div>
    </section>
  );
}
