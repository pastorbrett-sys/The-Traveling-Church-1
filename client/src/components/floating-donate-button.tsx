import { Heart } from "lucide-react";
import { DONATE_LINK } from "@/data/programs";

export default function FloatingDonateButton() {
  return (
    <>
      {/* Mobile: Small circular button with heart icon only */}
      <a
        href={DONATE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="floatingDonateBtn flex md:hidden fixed bottom-6 right-6 z-50 items-center justify-center w-12 h-12"
        data-testid="button-floating-donate-mobile"
        aria-label="Give Now"
      >
        <Heart className="w-5 h-5" fill="white" />
        <span className="floatingDonateBtnGlow" aria-hidden="true"></span>
      </a>
      
      {/* Desktop: Full button with text */}
      <a
        href={DONATE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="floatingDonateBtn hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-7 py-4"
        data-testid="button-floating-donate"
      >
        <Heart className="w-5 h-5" />
        Give Now
        <span className="floatingDonateBtnGlow" aria-hidden="true"></span>
      </a>
    </>
  );
}
