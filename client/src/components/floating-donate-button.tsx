import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function FloatingDonateButton() {
  return (
    <>
      <Link
        href="/donate"
        className="floatingDonateBtn flex md:hidden fixed bottom-6 right-6 z-50 items-center justify-center w-[62px] h-[62px]"
        data-testid="button-floating-donate-mobile"
        aria-label="Give Now"
      >
        <Heart className="w-[26px] h-[26px]" fill="white" />
        <span className="floatingDonateBtnGlow" aria-hidden="true"></span>
      </Link>
      
      <Link
        href="/donate"
        className="floatingDonateBtn hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-7 py-4"
        data-testid="button-floating-donate"
      >
        <Heart className="w-5 h-5" />
        Give Now
        <span className="floatingDonateBtnGlow" aria-hidden="true"></span>
      </Link>
    </>
  );
}
