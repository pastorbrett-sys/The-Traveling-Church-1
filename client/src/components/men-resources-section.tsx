import { Users } from "lucide-react";

export default function MenResourcesSection() {
  return (
    <section id="men-resources" className="py-16 md:py-24 bg-muted">
      <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Users className="w-12 h-12 text-primary" data-testid="icon-men-resources" />
          </div>
        </div>
        
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          data-testid="heading-men-resources"
        >
          Resources for Men
        </h2>
        
        <p 
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto"
          data-testid="text-men-resources-description"
        >
          Men of God often suffer in silence, burdened by their responsibilities and the weight that they carry. 
          Check out the "Men of God" platform, a resource just for men who need a place to be open and honest 
          and regain their strength!
        </p>

        <a
          href="https://www.menofgod.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-men-of-god"
        >
          Visit Men of God Platform
        </a>
      </div>
    </section>
  );
}
