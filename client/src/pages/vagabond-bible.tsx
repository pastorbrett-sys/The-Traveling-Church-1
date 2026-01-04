import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageCircle, Search, Heart, Users, MapPin, Mail, Sparkles } from "lucide-react";
import vagabondLogo from "@assets/Vagabond_Bible_AI_Icon_1767553973302.png";
import heroVideo from "@assets/Man_on_mountain_top_face_to_the_right_1767552623735.mp4";
import camperImage from "@assets/generated_images/person_in_camper_van.png";
import campfireImage from "@assets/generated_images/travelers_around_campfire.png";

export default function VagabondBible() {
  return (
    <div className="min-h-screen bg-[hsl(30,20%,97%)] text-[hsl(20,10%,25%)]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10" data-testid="img-vagabond-logo" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium" data-testid="link-features">Features</a>
              <a href="#about" className="text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium" data-testid="link-about">About</a>
              <a href="#community" className="text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium" data-testid="link-community">Community</a>
              <a href="#contact" className="text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium" data-testid="link-contact">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="text-[hsl(35,65%,55%)]">★</span>
              <span className="text-sm font-medium">Voted #1 Bible App by Experts</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              The Best <span className="text-[hsl(35,65%,55%)]">AI Bible</span><br />Ever Built
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Analyze verses, ask questions, dive deeper, and chat with our 24/7 pastor wherever, whenever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)] text-white text-lg px-8 rounded-full" data-testid="button-start-reading">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Reading
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[hsl(25,35%,45%)] text-lg px-8 rounded-full backdrop-blur-sm" data-testid="button-chat-pastor">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Pastor AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 text-[hsl(20,10%,20%)]">Powerful Features for Your Spiritual Journey</h2>
            <p className="text-[hsl(20,10%,40%)] text-lg max-w-2xl mx-auto">
              Everything you need to study, reflect, and grow — designed for life on the move.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-verse-insights">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(25,35%,45%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-[hsl(25,35%,45%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">AI Verse Insights</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Get AI-powered explanations of any verse with historical context, cultural background, and practical application.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-ai-chat">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(35,65%,55%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <MessageCircle className="w-7 h-7 text-[hsl(35,65%,55%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">24/7 Pastor Chat</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Have meaningful conversations about faith, get guidance, and explore biblical wisdom with our AI pastor.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-smart-search">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(15,45%,60%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-[hsl(15,45%,60%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">Smart Search</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Find any verse instantly. Search by keyword, topic, or theme across the entire Bible.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-notes">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(35,65%,55%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Heart className="w-7 h-7 text-[hsl(35,65%,55%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">Notes and Journal</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Save your reflections, bookmark favorite verses, and build your personal study journal.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-bible-reader">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(25,35%,45%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-[hsl(25,35%,45%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">Multi-Translation</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Access multiple Bible translations side-by-side. Compare verses across KJV, NIV, ESV, and more.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-offline">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(15,45%,60%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <MapPin className="w-7 h-7 text-[hsl(15,45%,60%)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">Built for Travelers</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  Designed for life on the road. Study anywhere, anytime — whether you have WiFi or not.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-[hsl(30,20%,97%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-[hsl(20,10%,20%)]">
                Faith Meets the <span className="text-[hsl(25,35%,45%)]">Open Road</span>
              </h2>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-6 leading-relaxed">
                Vagabond Bible AI was born from a simple truth: your spiritual journey shouldn't stop 
                just because you're on one. Whether you're a digital nomad, van-lifer, backpacker, 
                or simply someone who finds God in the great outdoors — this is for you.
              </p>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-8 leading-relaxed">
                We combine the timeless wisdom of Scripture with modern AI technology to create 
                a Bible study experience that travels with you. No church building required.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(25,35%,45%)]">66</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">Books</div>
                </div>
                <div className="w-px h-14 bg-[hsl(30,20%,85%)]" />
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(35,65%,55%)]">5+</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">Translations</div>
                </div>
                <div className="w-px h-14 bg-[hsl(30,20%,85%)]" />
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(15,45%,60%)]">24/7</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">AI Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src={camperImage} alt="Person studying in camper van" className="rounded-2xl shadow-xl" />
              <div className="absolute -bottom-6 -left-6 bg-[hsl(25,35%,45%)] text-white p-5 rounded-xl shadow-lg">
                <p className="font-medium text-lg">"My quiet time, anywhere."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img src={campfireImage} alt="Community around campfire" className="rounded-2xl shadow-xl" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-[hsl(35,65%,55%)]/10 text-[hsl(35,65%,45%)] px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Join the Community</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-[hsl(20,10%,20%)]">
                Connect with Fellow Travelers
              </h2>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-8 leading-relaxed">
                You're not alone on this journey. Join a growing community of vagabonds, nomads, 
                and seekers who are exploring faith on the move. Share insights, ask questions, 
                and find your tribe.
              </p>
              <Button size="lg" className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white rounded-full px-8" data-testid="button-join-community">
                <Users className="w-5 h-5 mr-2" />
                Join Our WhatsApp Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[hsl(25,35%,45%)] to-[hsl(25,35%,38%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-white">Ready to Start Your Journey?</h2>
          <p className="text-white/90 text-xl mb-10">
            Try Vagabond Bible AI free. No credit card required.
          </p>
          <Button size="lg" className="bg-white text-[hsl(25,35%,45%)] hover:bg-white/90 text-lg px-12 rounded-full" data-testid="button-try-free">
            <Sparkles className="w-5 h-5 mr-2" />
            Try It Free
          </Button>
        </div>
      </section>

      <footer id="contact" className="py-16 bg-[hsl(30,20%,97%)] border-t border-[hsl(30,20%,88%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10 mb-4" />
              <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                Your AI-powered Bible companion for life on the move.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 text-[hsl(20,10%,20%)]">Quick Links</h3>
              <ul className="space-y-3 text-[hsl(20,10%,40%)]">
                <li><a href="#features" className="hover:text-[hsl(25,35%,45%)] transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-[hsl(25,35%,45%)] transition-colors">About</a></li>
                <li><a href="#community" className="hover:text-[hsl(25,35%,45%)] transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 text-[hsl(20,10%,20%)]">Contact</h3>
              <div className="flex items-center gap-2 text-[hsl(20,10%,40%)] mb-3">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@vagabondbible.ai" className="hover:text-[hsl(25,35%,45%)] transition-colors" data-testid="link-email">
                  hello@vagabondbible.ai
                </a>
              </div>
              <p className="text-[hsl(20,10%,50%)] text-sm mt-4">
                A project by The Traveling Church
              </p>
            </div>
          </div>
          <div className="border-t border-[hsl(30,20%,88%)] mt-12 pt-8 text-center text-[hsl(20,10%,50%)] text-sm">
            © {new Date().getFullYear()} Vagabond Bible AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
