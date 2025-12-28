import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Copy, FileText, Mail } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function DafGiving() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "DAF Giving | The Traveling Church";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Give to The Traveling Church through your Donor-Advised Fund (DAF). Find our EIN, mailing details, and program designation options.");
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />
      
      <main className="pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Link>

          <div className="mb-8">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="heading-daf-title"
            >
              Give Through a Donor-Advised Fund (DAF)
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-daf-subhead">
              The Traveling Church gratefully accepts grants from Donor-Advised Funds, including Fidelity, Schwab, Vanguard, and Christian foundations.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4" data-testid="heading-how-to-give">
              How to Give
            </h2>
            <ol className="space-y-3 text-muted-foreground" data-testid="list-how-to-give">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-medium">1</span>
                <span>Log into your Donor-Advised Fund provider and recommend a grant to The Traveling Church.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-medium">2</span>
                <span>Use the details below to ensure your grant is directed correctly.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-medium">3</span>
                <span>Optionally add a note to designate a program (e.g., "Persecuted Christians Support & Relief") or choose "Fuel the Mission" for where most needed.</span>
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4" data-testid="heading-org-details">
              Organization Details
            </h2>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4" data-testid="card-org-details">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Legal Name</p>
                  <p className="font-medium">The Traveling Church Global</p>
                </div>
                <button 
                  onClick={() => copyToClipboard("The Traveling Church Global")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Copy legal name"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">EIN</p>
                  <p className="font-medium">41-3093491</p>
                </div>
                <button 
                  onClick={() => copyToClipboard("41-3093491")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Copy EIN"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Mailing Address</p>
                  <p className="font-medium">2499 Blue Heron Dr. Hudson, OH 44236</p>
                </div>
                <button 
                  onClick={() => copyToClipboard("2499 Blue Heron Dr. Hudson, OH 44236")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Copy mailing address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">thetravelingchurch.com</p>
                </div>
                <button 
                  onClick={() => copyToClipboard("thetravelingchurch.com")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Copy website"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Email (for grant questions)</p>
                  <p className="font-medium">pastorbrett@thetravelingchurch.com</p>
                </div>
                <button 
                  onClick={() => copyToClipboard("pastorbrett@thetravelingchurch.com")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Copy contact email"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="mb-10">
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
                <span>Iron Men Program</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Persecuted Christians Support & Relief Program</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Global Ministry & Presence Program</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Community Feeding & Direct Aid Program</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Economic Empowerment & Business Stewardship Program</span>
              </li>
            </ul>
          </section>

          <section className="mb-10">
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

          <section className="mb-10">
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
      </main>

      <Footer />
    </div>
  );
}
