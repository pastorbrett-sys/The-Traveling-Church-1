import { MessageCircle } from "lucide-react";

export default function WhatsAppSection() {
  const whatsappLink = "https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc";

  return (
    <section id="community" className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(142,76%,36%)] mb-6">
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="heading-whatsapp-community">
          Join Our Global Community
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-whatsapp-description">
          Connect with believers from around the world. Share experiences, pray together, 
          and stay updated on our ministry's journey across continents.
        </p>
        
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,32%)] text-white px-8 py-4 rounded-full font-medium text-lg transition-colors"
          data-testid="button-whatsapp-join"
        >
          <MessageCircle className="w-5 h-5" />
          Join WhatsApp Community
        </a>
      </div>
    </section>
  );
}
