import { Facebook, Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import footerLogo from "@assets/TC_Logo_All_white_1766882068583.png";

export default function Footer() {
  return (
    <footer className="text-primary-foreground py-8 px-4 bg-[#bf8e00]">
      <div className="max-w-4xl mx-auto text-center">
        <img 
          src={footerLogo}
          alt="The Traveling Church"
          className="h-14 mx-auto mb-3"
          data-testid="img-footer-logo"
        />
        <p 
          className="text-primary-foreground/80 text-sm mb-4"
          data-testid="text-footer-subtitle"
        >
          A global ministry reaching hearts worldwide
        </p>
        <div className="flex justify-center gap-6 mb-6">
          <a
            href="https://www.tiktok.com/@pastorbrett"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            data-testid="link-tiktok"
            aria-label="Follow us on TikTok"
          >
            <SiTiktok className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            data-testid="link-facebook"
            aria-label="Follow us on Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/the_bcuz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            data-testid="link-instagram"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>
        <p 
          className="text-primary-foreground/60 text-xs"
          data-testid="text-copyright"
        >© 2026 The Traveling Church. Spreading love and faith across the globe.</p>
      </div>
    </footer>
  );
}
