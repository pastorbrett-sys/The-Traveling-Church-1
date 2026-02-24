import { useEffect, useState } from "react";
import logoImage from "@assets/Traveling_Church_Vector_SVG_1766874390629.png";

export default function SecretBible() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "https://secretbible.org";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <img
        src={logoImage}
        alt="The Traveling Church"
        className="h-16 mb-8 opacity-80"
        data-testid="img-tc-logo"
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-redirect-heading">
        The Secret Bible
      </h1>

      <p className="text-lg text-muted-foreground mb-8 max-w-md" data-testid="text-redirect-message">
        A Bible hidden in plain sight — brought to you by The Traveling Church.
      </p>

      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground" data-testid="text-countdown">
          Redirecting in {countdown}...
        </p>
      </div>

      <a
        href="https://secretbible.org"
        className="mt-8 text-primary underline hover:text-primary/80 transition-colors text-sm"
        data-testid="link-skip-redirect"
      >
        Go now
      </a>
    </div>
  );
}
