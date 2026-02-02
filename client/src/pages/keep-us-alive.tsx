import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DONATE_LINK } from "@/data/programs";
import pastorBrettImage from "@assets/Mask_group_1770059326771.png";

const faqItems = [
  {
    question: "Is my gift tax-deductible?",
    answer: "Yes. The Traveling Church Global is organized as a nonprofit. You'll receive a receipt for your records."
  },
  {
    question: "Where does the money go?",
    answer: "Direct ministry costs: platform + tools + mission expenses + direct aid."
  },
  {
    question: "Can I give once instead of monthly?",
    answer: "Absolutely — one-time gifts help a lot."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-4 flex items-center justify-between text-left"
        data-testid={`faq-toggle-${question.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 px-4 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function KeepUsAlive() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Pastor Brett image */}
            <div className="mb-8">
              <img 
                src={pastorBrettImage} 
                alt="Pastor Brett" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto border-4 border-primary/20 shadow-lg"
                data-testid="img-pastor-brett"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-keep-us-alive">
              Keep This Ministry Alive
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              The Traveling Church is fully digital — no building, no staff, no budget cushion. I'm building this mission solo, while funding real mission work out of my own pocket.
            </p>
            
            {/* CTA Buttons - Above the fold */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#b8860b] hover:bg-[#9a7209] text-white px-8 py-4 rounded-full font-medium text-lg transition-colors"
                data-testid="button-monthly-supporter-top"
              >
                Become a Monthly Supporter
              </a>
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b]/10 px-8 py-4 rounded-full font-medium text-lg transition-colors"
                data-testid="button-one-time-gift-top"
              >
                Give a One-Time Gift
              </a>
            </div>
          </div>
        </section>
        
        {/* Why I'm Asking */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" data-testid="heading-why-asking">
              Why I'm Asking
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I don't have an organization backing this. If a small group of people steps in with monthly support, this survives. If not, it eventually shuts down. I'm keeping this simple and honest because it matters.
            </p>
          </div>
        </section>
        
        {/* What Your Support Covers */}
        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" data-testid="heading-support-covers">
              What Your Support Covers
            </h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Core tools & infrastructure (website, platform, AI costs)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Direct aid & mission expenses (food, transport, urgent help)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Time to pastor, build, and keep the ministry moving</span>
              </li>
            </ul>
          </div>
        </section>
        
        {/* The Goal */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" data-testid="heading-goal">
              The Goal
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm aiming for <strong className="text-foreground">25 monthly supporters</strong> at <strong className="text-foreground">$40/month</strong> (or whatever you can do). That's enough to keep everything alive and growing.
            </p>
          </div>
        </section>
        
        {/* Bottom CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#b8860b] hover:bg-[#9a7209] text-white px-8 py-4 rounded-full font-medium text-lg transition-colors"
                data-testid="button-monthly-supporter-bottom"
              >
                Become a Monthly Supporter
              </a>
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b]/10 px-8 py-4 rounded-full font-medium text-lg transition-colors"
                data-testid="button-one-time-gift-bottom"
              >
                Give a One-Time Gift
              </a>
            </div>
            
            {/* Thank you message */}
            <p className="text-muted-foreground italic max-w-lg mx-auto">
              If this ministry has ever encouraged you, helped you, or mattered to you — thank you for being here. And if you can help keep it alive, I'm deeply grateful.
              <br />
              <span className="block mt-2 not-italic font-medium text-foreground">— Pastor Brett</span>
            </p>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6" data-testid="heading-faq">
              Questions
            </h2>
            <div className="bg-card rounded-lg border border-border">
              {faqItems.map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
