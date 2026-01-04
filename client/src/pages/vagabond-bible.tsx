import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageCircle, Search, Heart, Users, MapPin, Mail, Sparkles } from "lucide-react";
import vagabondLogo from "@assets/image_1767551915880.png";
import heroImage from "@assets/generated_images/traveler_reading_by_lake.png";
import camperImage from "@assets/generated_images/person_in_camper_van.png";
import campfireImage from "@assets/generated_images/travelers_around_campfire.png";

export default function VagabondBible() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10" data-testid="img-vagabond-logo" />
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-stone-400 hover:text-amber-500 transition-colors" data-testid="link-features">Features</a>
              <a href="#about" className="text-stone-400 hover:text-amber-500 transition-colors" data-testid="link-about">About</a>
              <a href="#community" className="text-stone-400 hover:text-amber-500 transition-colors" data-testid="link-community">Community</a>
              <a href="#contact" className="text-stone-400 hover:text-amber-500 transition-colors" data-testid="link-contact">Contact</a>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-get-started">
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Traveler reading by a lake" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your <span className="text-amber-500">AI-Powered</span> Bible Companion for the Journey
            </h1>
            <p className="text-xl text-stone-300 mb-8 leading-relaxed">
              Whether you're on the road, at camp, or exploring new horizons — Vagabond Bible AI brings 
              wisdom, insight, and spiritual guidance wherever your travels take you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8" data-testid="button-start-reading">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Reading
              </Button>
              <Button size="lg" variant="outline" className="border-stone-600 text-stone-200 hover:bg-stone-800 text-lg px-8" data-testid="button-chat-pastor">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Pastor AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features for Your Spiritual Journey</h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Everything you need to study, reflect, and grow — designed for life on the move.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-bible-reader">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">Multi-Translation Bible Reader</h3>
                <p className="text-stone-400">
                  Access multiple Bible translations side-by-side. Compare verses across KJV, NIV, ESV, and more.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-ai-chat">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">AI Pastor Chat</h3>
                <p className="text-stone-400">
                  Have meaningful conversations about faith, get guidance, and explore biblical wisdom with our AI pastor.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-smart-search">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">Smart Search</h3>
                <p className="text-stone-400">
                  Find any verse instantly. Search by keyword, topic, or theme across the entire Bible.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-verse-insights">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">Verse Insights</h3>
                <p className="text-stone-400">
                  Get AI-powered explanations of any verse with historical context, cultural background, and practical application.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-notes">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">Personal Notes</h3>
                <p className="text-stone-400">
                  Save your reflections, bookmark favorite verses, and build your personal study journal.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-stone-800 border-stone-700" data-testid="card-feature-offline">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-2">Built for Travelers</h3>
                <p className="text-stone-400">
                  Designed for life on the road. Study anywhere, anytime — whether you have WiFi or not.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Faith Meets the <span className="text-amber-500">Open Road</span>
              </h2>
              <p className="text-stone-300 text-lg mb-6 leading-relaxed">
                Vagabond Bible AI was born from a simple truth: your spiritual journey shouldn't stop 
                just because you're on one. Whether you're a digital nomad, van-lifer, backpacker, 
                or simply someone who finds God in the great outdoors — this is for you.
              </p>
              <p className="text-stone-300 text-lg mb-6 leading-relaxed">
                We combine the timeless wisdom of Scripture with modern AI technology to create 
                a Bible study experience that travels with you. No church building required.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">66</div>
                  <div className="text-stone-400 text-sm">Books</div>
                </div>
                <div className="w-px h-12 bg-stone-700" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">5+</div>
                  <div className="text-stone-400 text-sm">Translations</div>
                </div>
                <div className="w-px h-12 bg-stone-700" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">24/7</div>
                  <div className="text-stone-400 text-sm">AI Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src={camperImage} alt="Person studying in camper van" className="rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 bg-amber-600 text-white p-4 rounded-xl shadow-lg">
                <p className="font-semibold">"My quiet time, anywhere."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="py-24 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src={campfireImage} alt="Community around campfire" className="rounded-2xl shadow-2xl" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-500 px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Join the Community</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Connect with Fellow Travelers
              </h2>
              <p className="text-stone-300 text-lg mb-6 leading-relaxed">
                You're not alone on this journey. Join a growing community of vagabonds, nomads, 
                and seekers who are exploring faith on the move. Share insights, ask questions, 
                and find your tribe.
              </p>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-join-community">
                <Users className="w-5 h-5 mr-2" />
                Join Our WhatsApp Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-stone-300 text-lg mb-8">
            Try Vagabond Bible AI free. No credit card required.
          </p>
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-12" data-testid="button-try-free">
            <Sparkles className="w-5 h-5 mr-2" />
            Try It Free
          </Button>
        </div>
      </section>

      <footer id="contact" className="py-16 bg-stone-900 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10 mb-4" />
              <p className="text-stone-400">
                Your AI-powered Bible companion for life on the move.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#features" className="hover:text-amber-500 transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-amber-500 transition-colors">About</a></li>
                <li><a href="#community" className="hover:text-amber-500 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="flex items-center gap-2 text-stone-400 mb-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@vagabondbible.ai" className="hover:text-amber-500 transition-colors" data-testid="link-email">
                  hello@vagabondbible.ai
                </a>
              </div>
              <p className="text-stone-400 text-sm mt-4">
                A project by The Traveling Church
              </p>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-500 text-sm">
            © {new Date().getFullYear()} Vagabond Bible AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
