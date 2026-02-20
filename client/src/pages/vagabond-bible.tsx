import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageCircle, Search, Heart, Users, MapPin, Mail, Sparkles, Menu, X } from "lucide-react";
import vagabondLogo from "@/assets/vagabond-logo.png";
import vagabondLogoWhite from "@assets/Bigger_White_Logo_1767824644015.png";
import heroVideo from "@assets/text-to-video-28b9692b_1767558425367.mp4";
import camperImage from "@assets/generated_images/person_in_camper_van.png";
import campfireImage from "@assets/generated_images/travelers_around_campfire.png";
import ladderIcon from "@assets/Vagabond_Icon_1767598919164.png";
import vagaburstIcon from "@assets/Vagaburst_1767599907611.png";
import burstIcon from "@assets/Burst_1767600505667.png";
import { usePlatform } from "@/contexts/platform-context";
import { t, detectLanguage } from "@/lib/i18n";

export default function VagabondBible() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isNative, platform } = usePlatform();
  const isAmharic = detectLanguage() === "am";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isNative) {
    return (
      <div className="min-h-screen bg-black">
        <section className="relative min-h-[100svh] flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div 
            className="absolute left-0 right-0 z-10 w-full px-6"
            style={{ bottom: platform === 'android' ? '32px' : 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}
          >
            <div className="max-w-md mx-auto text-center">
              <h1 className={`font-heading mb-4 text-white font-extrabold leading-[1.12] ${isAmharic ? 'text-[28px] sm:text-4xl' : 'text-[36px] sm:text-5xl'}`}>
                {t("landing.hero_title_1")} <span className="text-[hsl(35,65%,55%)]">{t("landing.hero_title_2")}</span><br />{t("landing.hero_title_3")}
              </h1>
              <p className="text-[15px] text-white/90 mb-10 leading-relaxed">
                {t("landing.hero_subtitle_1")} {t("landing.hero_subtitle_2")}
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/pastor-chat?tab=chat">
                  <Button size="lg" className="w-full hover:bg-[#a37a00] text-white px-8 rounded-full bg-[#be9009] text-[16px] active:scale-95 transition-transform duration-200 transform-gpu" data-testid="button-start-reading-native">
                    <Users className="w-5 h-5 mr-2" />
                    {t("landing.cta_start")}
                  </Button>
                </Link>
                <Link href="/pastor-chat?tab=bible">
                  <Button size="lg" variant="outline" className="w-full border border-white text-white hover:bg-white/10 px-8 rounded-full text-[16px] active:scale-95 transition-transform duration-200 transform-gpu bg-transparent" data-testid="button-start-praying-native">
                    <BookOpen className="w-5 h-5 mr-2" />
                    {t("landing.cta_pray")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div 
            className="absolute left-0 right-0 z-10 flex items-center px-4" 
            style={{ top: platform === 'android' ? 'calc(var(--android-status-bar-height, 44px) + 12px)' : 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
            data-testid="native-header-logo"
          >
            <div className="flex-1 h-px bg-gray-400/15" />
            <img src={vagabondLogoWhite} alt="Vagabond Bible" className="h-8 mx-4" />
            <div className="flex-1 h-px bg-gray-400/15" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(30,20%,97%)] text-[hsl(20,10%,25%)]">
      <nav className={`fixed top-0 left-0 right-0 z-50 ${
        mobileMenuOpen 
          ? 'bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)]' 
          : isScrolled 
            ? 'bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)] transition-all duration-300' 
            : 'bg-transparent border-b border-transparent transition-all duration-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img 
              src={(isScrolled || mobileMenuOpen) ? vagabondLogo : vagabondLogoWhite} 
              alt="Vagabond Bible AI" 
              className="h-11 transition-opacity duration-300" 
              data-testid="img-vagabond-logo" 
            />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-[14px] transition-colors font-medium ${isScrolled ? 'text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)]' : 'text-white/90 hover:text-white'}`} data-testid="link-features">{t("landing.nav_features")}</a>
              <a href="#about" className={`text-[14px] transition-colors font-medium ${isScrolled ? 'text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)]' : 'text-white/90 hover:text-white'}`} data-testid="link-about">{t("landing.nav_about")}</a>
              <a href="#community" className={`text-[14px] transition-colors font-medium ${isScrolled ? 'text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)]' : 'text-white/90 hover:text-white'}`} data-testid="link-community">{t("landing.nav_community")}</a>
              <a href="#contact" className={`text-[14px] transition-colors font-medium ${isScrolled ? 'text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)]' : 'text-white/90 hover:text-white'}`} data-testid="link-contact">{t("landing.nav_contact")}</a>
              <Link href="/login">
                <Button className="bg-[hsl(35,65%,55%)] hover:bg-[hsl(35,65%,45%)] text-white font-medium px-5 py-2 rounded-full text-[14px] md:hover:scale-105 active:scale-95 transition-transform duration-200 transform-gpu" data-testid="button-login">
                  {t("landing.nav_login")}
                </Button>
              </Link>
            </div>
            <button
              className="md:hidden p-2 relative w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <X 
                key={mobileMenuOpen ? 'x-visible' : 'x-hidden'}
                className={`w-6 h-6 stroke-[1.5] absolute ${(isScrolled || mobileMenuOpen) ? 'text-[hsl(20,10%,40%)]' : 'text-white'} ${mobileMenuOpen ? 'menu-icon-enter' : 'opacity-0'}`} 
              />
              <Menu 
                key={mobileMenuOpen ? 'menu-hidden' : 'menu-visible'}
                className={`w-6 h-6 stroke-[1.5] absolute ${(isScrolled || mobileMenuOpen) ? 'text-[hsl(20,10%,40%)]' : 'text-white'} ${!mobileMenuOpen ? 'menu-icon-enter' : 'opacity-0'}`} 
              />
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[hsl(30,20%,88%)] py-4 pb-[21px]">
              <div className="flex flex-col gap-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium px-2 animate-fade-in-up" style={{ animationDelay: '0ms' }} data-testid="link-features-mobile">{t("landing.nav_features")}</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium px-2 animate-fade-in-up" style={{ animationDelay: '50ms' }} data-testid="link-about-mobile">{t("landing.nav_about")}</a>
                <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium px-2 animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="link-community-mobile">{t("landing.nav_community")}</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[14px] text-[hsl(20,10%,40%)] hover:text-[hsl(25,35%,45%)] transition-colors font-medium px-2 animate-fade-in-up" style={{ animationDelay: '150ms' }} data-testid="link-contact-mobile">{t("landing.nav_contact")}</a>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mt-[5px]">
                  <Button className="bg-[hsl(35,65%,55%)] hover:bg-[hsl(35,65%,45%)] text-white font-medium w-full rounded-full text-[14px] animate-fade-in-up" style={{ animationDelay: '200ms' }} data-testid="button-login-mobile">
                    {t("landing.nav_login")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      <section className="relative min-h-[100svh] flex items-center">
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
          <div className="max-w-2xl text-center" style={{ transform: 'translateY(2px)' }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 border border-white/20 scale-[0.94]">
              <span className="text-[hsl(35,65%,55%)]">★</span>
              <span className="text-sm font-medium">{t("landing.badge")}</span>
            </div>
            <h1 className={`font-heading mb-6 text-white font-extrabold leading-[1.12] sm:leading-[1.06] ${isAmharic ? 'text-[32px] sm:text-4xl lg:text-[52px]' : 'text-[40px] sm:text-5xl lg:text-[68px]'}`}>
              {t("landing.hero_title_1")} <span className="text-[hsl(35,65%,55%)]">{t("landing.hero_title_2")}</span><br />{t("landing.hero_title_3")}
            </h1>
            <p className="sm:text-xl lg:text-[18px] text-white/90 mb-8 text-[16px]">
              {t("landing.hero_subtitle_1")} <br className="hidden lg:inline" />{t("landing.hero_subtitle_2")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/pastor-chat?tab=chat" className="w-[75%] sm:w-auto mx-auto sm:mx-0">
                <Button size="lg" className="w-full sm:w-auto hover:bg-[#a37a00] text-white px-8 rounded-full bg-[#be9009] pl-[20px] pr-[20px] text-[16px] md:hover:scale-105 active:scale-95 transition-transform duration-200 transform-gpu" data-testid="button-start-reading">
                  <Users className="w-5 h-5 mr-2" />
                  {t("landing.cta_start")}
                </Button>
              </Link>
              <Link href="/pastor-chat?tab=bible" className="w-[75%] sm:w-auto mx-auto sm:mx-0">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border border-white text-white hover:bg-white/10 px-8 rounded-full pl-[20px] pr-[20px] text-[16px] md:hover:scale-105 active:scale-95 transition-transform duration-200 transform-gpu bg-transparent" data-testid="button-start-praying">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("landing.cta_pray")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white" style={{ paddingTop: '65px', paddingBottom: '10px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[hsl(20,10%,30%)] font-heading text-lg font-semibold mb-5">Download the App!</p>
          <div className="flex flex-row gap-4 justify-center">
            <a href="https://apps.apple.com/us/app/vagabond-bible/id6757680520" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-black hover:bg-black/80 text-white pl-3 pr-4 py-2 rounded-lg transition-all duration-200 md:hover:scale-105 active:scale-95 transform-gpu" data-testid="link-app-store">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-normal">Download on the</span>
                <span className="text-[16px] font-semibold -mt-0.5">App Store</span>
              </div>
            </a>
            <button 
              onClick={() => {
                const isAmharic = detectLanguage() === "am";
                alert(isAmharic ? "በቅርቡ ይጠብቁ!" : "Coming Soon!");
              }}
              className="inline-flex items-center gap-2.5 bg-black hover:bg-black/80 text-white pl-3 pr-4 py-2 rounded-lg transition-all duration-200 md:hover:scale-105 active:scale-95 transform-gpu text-left" 
              data-testid="link-google-play"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 3.658L16.8 9.99l-2.302 2.302L5.864 3.658z"/>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-normal">Get it on</span>
                <span className="text-[16px] font-semibold -mt-0.5">Google Play</span>
              </div>
            </button>
          </div>
        </div>
      </section>
      <section id="features" className="pt-12 pb-24 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <img src={ladderIcon} alt="Vagabond Icon" className="w-[80px] h-[80px] sm:w-[160px] sm:h-[160px] mx-auto mb-[35px] sm:mb-6" data-testid="img-features-icon" />
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 text-[hsl(20,10%,20%)]">{t("landing.features_title")}</h2>
            <p className="text-[hsl(20,10%,40%)] text-lg max-w-2xl mx-auto">
              {t("landing.features_subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-verse-insights">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(25,35%,45%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-[hsl(25,35%,45%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_insights_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_insights_desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-ai-chat">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(35,65%,55%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <MessageCircle className="w-7 h-7 text-[hsl(35,65%,55%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_chat_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_chat_desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-smart-search">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(15,45%,60%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-[hsl(15,45%,60%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_search_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_search_desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-notes">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(35,65%,55%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <Heart className="w-7 h-7 text-[hsl(35,65%,55%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_notes_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_notes_desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-bible-reader">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(25,35%,45%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-[hsl(25,35%,45%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_translations_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_translations_desc")}
                </p>
              </CardContent>
            </Card>
            <Card className="group bg-white border border-[hsl(30,20%,88%)] shadow-sm hover:shadow-lg transition-shadow rounded-2xl" data-testid="card-feature-offline">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-[hsl(15,45%,60%)]/10 rounded-xl flex items-center justify-center mb-5">
                  <MapPin className="w-7 h-7 text-[hsl(15,45%,60%)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[hsl(20,10%,20%)] mb-3">{t("landing.feature_travelers_title")}</h3>
                <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                  {t("landing.feature_travelers_desc")}
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
              <h2 className="font-heading text-[38px] font-semibold mb-6 text-[hsl(20,10%,20%)] leading-[43px]">
                {t("landing.about_title_1")} <span className="text-[hsl(25,35%,45%)]">{t("landing.about_title_2")}</span>
              </h2>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-6 leading-relaxed">
                {t("landing.about_p1")}
              </p>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-8 leading-relaxed">
                {t("landing.about_p2")}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(25,35%,45%)]">66</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">{t("landing.about_books")}</div>
                </div>
                <div className="w-px h-14 bg-[hsl(30,20%,85%)]" />
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(35,65%,55%)]">5+</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">{t("landing.about_translations")}</div>
                </div>
                <div className="w-px h-14 bg-[hsl(30,20%,85%)]" />
                <div className="text-center">
                  <div className="font-heading text-4xl font-bold text-[hsl(15,45%,60%)]">24/7</div>
                  <div className="text-[hsl(20,10%,40%)] text-sm font-medium">{t("landing.about_support")}</div>
                </div>
              </div>
            </div>
            <div className="relative overflow-visible">
              <img src={camperImage} alt="Person studying in camper van" className="rounded-2xl shadow-xl" />
              <img src={vagaburstIcon} alt="" className="absolute -top-[43px] -right-[43px] sm:-top-[53px] sm:-right-[53px] w-[85px] h-[85px] sm:w-[106px] sm:h-[106px] drop-shadow-lg" />
              <div className="absolute -bottom-6 -left-6 text-white p-5 rounded-xl shadow-lg bg-[#d79942]">
                <p className="font-medium text-lg">"{t("landing.about_quote")}"</p>
              </div>
              {/* Fireflies floating over the image */}
              <div className="fireflies-container">
                <div className="firefly firefly-1" style={{ top: '20%', left: '15%' }} />
                <div className="firefly firefly-2" style={{ top: '35%', right: '20%' }} />
                <div className="firefly firefly-3" style={{ top: '50%', left: '25%' }} />
                <div className="firefly firefly-4" style={{ top: '15%', right: '35%' }} />
                <div className="firefly firefly-5" style={{ top: '60%', left: '40%' }} />
                <div className="firefly firefly-6" style={{ top: '40%', left: '60%' }} />
                <div className="firefly firefly-7" style={{ top: '25%', left: '75%' }} />
                <div className="firefly firefly-8" style={{ top: '55%', right: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="community" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative overflow-visible">
              <img src={campfireImage} alt="Community around campfire" className="rounded-2xl shadow-xl animate-campfire" />
              <img src={burstIcon} alt="" className="absolute -top-8 -left-8 sm:-top-10 sm:-left-10 w-20 h-20 sm:w-24 sm:h-24" />
              {/* Yellow ember bubbles rising from the fire */}
              <div className="embers-container">
                <div className="ember ember-1" style={{ bottom: '30%', left: '35%' }} />
                <div className="ember ember-2" style={{ bottom: '28%', left: '45%' }} />
                <div className="ember ember-3" style={{ bottom: '32%', left: '55%' }} />
                <div className="ember ember-4" style={{ bottom: '25%', left: '40%' }} />
                <div className="ember ember-5" style={{ bottom: '30%', left: '50%' }} />
                <div className="ember ember-6" style={{ bottom: '27%', left: '60%' }} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-[hsl(35,65%,55%)]/10 text-[hsl(35,65%,45%)] px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{t("landing.community_badge")}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-[hsl(20,10%,20%)]">
                {t("landing.community_title")}
              </h2>
              <p className="text-[hsl(20,10%,35%)] text-lg mb-8 leading-relaxed">
                {t("landing.community_desc")}
              </p>
              <a href="https://thetravelingchurch.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-[hsl(35,65%,55%)] hover:bg-[hsl(35,65%,45%)] text-white rounded-full px-8 md:hover:scale-105 active:scale-95 transition-transform duration-200 transform-gpu" data-testid="button-join-community">
                  <Users className="w-5 h-5 mr-2" />
                  {t("landing.community_button")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 from-[hsl(25,35%,45%)] to-[hsl(25,35%,38%)] text-[#d79942] bg-[#d79942]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-white">{t("landing.cta_section_title")}</h2>
          <p className="text-white/90 text-xl mb-10">
            {t("landing.cta_section_desc")}
          </p>
          <Link href="/pastor-chat">
            <Button size="lg" className="bg-white text-[hsl(25,35%,45%)] hover:bg-white/90 hover:scale-105 transition-all duration-200 text-lg px-12 rounded-full" data-testid="button-try-free">
              <Sparkles className="w-5 h-5 mr-2" />
              {t("landing.cta_try_free")}
            </Button>
          </Link>
        </div>
      </section>
      <footer id="contact" className="py-16 bg-[hsl(30,20%,97%)] border-t border-[hsl(30,20%,88%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10 mb-4" />
              <p className="text-[hsl(20,10%,40%)] leading-relaxed">
                {t("landing.footer_tagline")}
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 text-[hsl(20,10%,20%)]">{t("landing.footer_quick_links")}</h3>
              <ul className="space-y-3 text-[hsl(20,10%,40%)]">
                <li><a href="#features" className="hover:text-[hsl(25,35%,45%)] transition-colors">{t("landing.nav_features")}</a></li>
                <li><a href="#about" className="hover:text-[hsl(25,35%,45%)] transition-colors">{t("landing.nav_about")}</a></li>
                <li><a href="#community" className="hover:text-[hsl(25,35%,45%)] transition-colors">{t("landing.nav_community")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 text-[hsl(20,10%,20%)]">{t("landing.footer_contact")}</h3>
              <div className="flex items-center gap-2 text-[hsl(20,10%,40%)] mb-3">
                <Mail className="w-4 h-4" />
                <a href="mailto:Pastorbrett@thetravelingchurch.com" className="hover:text-[hsl(25,35%,45%)] transition-colors" data-testid="link-email">
                  Pastorbrett@thetravelingchurch.com
                </a>
              </div>
              <p className="text-[hsl(20,10%,50%)] text-sm mt-4">
                {t("landing.footer_project_by")}
              </p>
            </div>
          </div>
          <div className="border-t border-[hsl(30,20%,88%)] mt-12 pt-8 text-center text-[hsl(20,10%,50%)] text-sm">
            © {new Date().getFullYear()} {t("landing.footer_copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
