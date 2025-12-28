import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Copy, FileText, Mail, ExternalLink, Heart, Check } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import dafBannerImage from "@assets/generated_images/people_at_table_holding_hands.png";

export default function DafGiving() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "DAF Giving | The Traveling Church";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Give to The Traveling Church through your Donor-Advised Fund (DAF). Find our EIN, mailing details, and program designation options.");
    }
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pt-5 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Link>

          <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
            <div className="relative">
              <div className="w-full h-48 md:h-64 overflow-hidden">
                <img
                  src={dafBannerImage}
                  alt="Hands united in charitable giving"
                  className="w-full h-full object-cover"
                  data-testid="img-daf-banner"
                />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10">
                <div className="programsHeroIcon inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 pt-12 pb-8 px-6 md:px-8 text-center">
              <h1 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
                data-testid="heading-daf-title"
              >
                Give Through a Donor-Advised Fund (DAF)
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-daf-subhead">
                The Traveling Church gratefully accepts grants from Donor-Advised Funds, including Fidelity, Schwab, Vanguard, and Christian foundations.
              </p>
            </div>

            <div className="p-6 md:p-10 space-y-10">
              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-how-to-give">
                  How to Give
                </h2>
                <ol className="space-y-3 text-muted-foreground" data-testid="list-how-to-give">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm inline-flex items-center justify-center font-medium leading-none text-center">1</span>
                    <span>Log into your Donor-Advised Fund provider and recommend a grant to The Traveling Church.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm inline-flex items-center justify-center font-medium leading-none text-center">2</span>
                    <span>Use the details below to ensure your grant is directed correctly.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm inline-flex items-center justify-center font-medium leading-none text-center">3</span>
                    <span>Optionally add a note to designate a program (e.g., "Persecuted Christians Support & Relief") or choose "Fuel the Mission" for where most needed.</span>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-org-details">
                  Organization Details
                </h2>
                <div className="bg-muted rounded-lg p-6 space-y-4" data-testid="card-org-details">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Legal Name</p>
                      <p className="font-medium">The Traveling Church Global</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("The Traveling Church Global", "legalName")}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      aria-label="Copy legal name"
                    >
                      {copiedField === "legalName" ? <Check className="w-4 h-4 text-primary animate-in zoom-in duration-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">EIN</p>
                      <p className="font-medium">41-3093491</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("41-3093491", "ein")}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      aria-label="Copy EIN"
                    >
                      {copiedField === "ein" ? <Check className="w-4 h-4 text-primary animate-in zoom-in duration-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Mailing Address</p>
                      <p className="font-medium">2499 Blue Heron Dr. Hudson, OH 44236</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("2499 Blue Heron Dr. Hudson, OH 44236", "address")}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      aria-label="Copy mailing address"
                    >
                      {copiedField === "address" ? <Check className="w-4 h-4 text-primary animate-in zoom-in duration-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <p className="font-medium">thetravelingchurch.com</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("thetravelingchurch.com", "website")}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      aria-label="Copy website"
                    >
                      {copiedField === "website" ? <Check className="w-4 h-4 text-primary animate-in zoom-in duration-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Email (for grant questions)</p>
                      <p className="font-medium">pastorbrett@thetravelingchurch.com</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard("pastorbrett@thetravelingchurch.com", "email")}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      aria-label="Copy contact email"
                    >
                      {copiedField === "email" ? <Check className="w-4 h-4 text-primary animate-in zoom-in duration-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-designate-gift">
                  Designate Your Gift
                </h2>
                <p className="text-muted-foreground mb-4">
                  DAF donors may recommend grants to one of the programs below, or choose Fuel the Mission for general support.
                </p>
                <ul className="space-y-2 text-muted-foreground" data-testid="list-programs">
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Fuel the Mission (general support)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="md:hidden">Iron Men Program</span>
                    <a href="/programs/iron-men" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:flex items-center gap-1">
                      Iron Men Program
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="md:hidden">Persecuted Christians Support & Relief Program</span>
                    <a href="/programs/persecuted-christians" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:flex items-center gap-1">
                      Persecuted Christians Support & Relief Program
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="md:hidden">Global Ministry & Presence Program</span>
                    <a href="/programs/global-itinerant-ministry" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:flex items-center gap-1">
                      Global Ministry & Presence Program
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="md:hidden">Community Feeding & Direct Aid Program</span>
                    <a href="/programs/community-feeding" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:flex items-center gap-1">
                      Community Feeding & Direct Aid Program
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="md:hidden">Economic Empowerment & Business Stewardship Program</span>
                    <a href="/programs/economic-empowerment" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:flex items-center gap-1">
                      Economic Empowerment & Business Stewardship Program
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-provider-notes">
                  Notes for Your Provider
                </h2>
                <ul className="space-y-2 text-muted-foreground" data-testid="list-provider-notes">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Please make checks payable to: The Traveling Church Global</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Include "DAF Grant" and your program designation (if any) in the memo line.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>No goods or services are provided in exchange for charitable contributions.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4" data-testid="heading-questions">
                  Questions?
                </h2>
                <p className="text-muted-foreground mb-4">
                  If your DAF provider needs verification or a letter of good standing, email us and we'll respond quickly.
                </p>
                <a
                  href="mailto:pastorbrett@thetravelingchurch.com"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  data-testid="button-email-us"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
