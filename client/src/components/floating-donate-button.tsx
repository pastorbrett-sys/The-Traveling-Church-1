import { Heart } from "lucide-react";
import { DONATE_LINK } from "@/data/programs";

export default function FloatingDonateButton() {
  return (
    <a
      href={DONATE_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 bg-[#0077B6] hover:bg-[#00B4D8] text-white px-6 py-3 rounded-full font-medium shadow-lg transition-colors"
      data-testid="button-floating-donate"
    >
      <Heart className="w-5 h-5" />
      Give Now
    </a>
  );
}
