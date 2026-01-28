import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isVagabondBibleDomain } from "@/lib/host-detection";
import { DynamicHead } from "@/components/dynamic-head";
import { PlatformProvider } from "@/contexts/platform-context";
import { RevenueCatProvider } from "@/contexts/revenuecat-context";
import { PrayerAudioProvider } from "@/contexts/prayer-audio-context";
import { FloatingPrayerButton } from "@/components/floating-prayer-button";
import { PlatformToggle } from "@/components/platform-toggle";
import { NativeTabBar } from "@/components/native-tab-bar";
import { OfflineBanner } from "@/components/offline-banner";
import { useDeepLinks } from "@/hooks/use-deep-links";
import { useReferralCapture } from "@/hooks/use-referral";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

import Programs from "@/pages/programs";
import ProgramDetail from "@/pages/program-detail";
import DafGiving from "@/pages/daf-giving";
import MissionEthiopia from "@/pages/mission-ethiopia";
import MissionJerusalem from "@/pages/mission-jerusalem";
import MissionEgypt from "@/pages/mission-egypt";
import MissionCambodia from "@/pages/mission-cambodia";
import MissionThailand from "@/pages/mission-thailand";
import MissionJordan from "@/pages/mission-jordan";
import Missions from "@/pages/missions";
import PastorChat from "@/pages/pastor-chat";
import Notes from "@/pages/notes";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutCancel from "@/pages/checkout-cancel";
import VagabondBible from "@/pages/vagabond-bible";
import NativeAuthCallback from "@/pages/native-auth-callback";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Support from "@/pages/support";
import EmailPreview from "@/pages/email-preview";
import AdminEthiopianBible from "@/pages/admin-ethiopian-bible";
import AmbassadorPage from "@/pages/ambassador/index";
import AdminPanel from "@/pages/admin/index";
import PrayerTimer from "@/pages/prayer-timer";
import PrayerRequests from "@/pages/prayer-requests";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function VagabondBibleRouter() {
  return (
    <Switch>
      <Route path="/" component={VagabondBible} />
      <Route path="/pastor-chat" component={PastorChat} />
      <Route path="/bible-buddy" component={PastorChat} />
      <Route path="/notes" component={Notes} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/native-auth-callback" component={NativeAuthCallback} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      <Route path="/admin/ethiopian-bible" component={AdminEthiopianBible} />
      <Route path="/ambassador" component={AmbassadorPage} />
      <Route path="/ambassador/pending">{() => <Redirect to="/ambassador" />}</Route>
      <Route path="/ambassador/dashboard">{() => <Redirect to="/ambassador" />}</Route>
      <Route path="/admin" component={AdminPanel} />
      <Route path="/email-preview" component={EmailPreview} />
      <Route path="/prayer-timer" component={PrayerTimer} />
      <Route path="/prayer-requests" component={PrayerRequests} />
      <Route path="/vagabond-bible">{() => <Redirect to="/" />}</Route>
      <Route>{() => <Redirect to="/" />}</Route>
    </Switch>
  );
}

function ChurchRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/:slug" component={ProgramDetail} />
      <Route path="/donor-advised-funds" component={DafGiving} />
      <Route path="/daf" component={DafGiving} />
      <Route path="/missions/ethiopia" component={MissionEthiopia} />
      <Route path="/missions/jerusalem" component={MissionJerusalem} />
      <Route path="/missions/egypt" component={MissionEgypt} />
      <Route path="/missions/cambodia" component={MissionCambodia} />
      <Route path="/missions/thailand" component={MissionThailand} />
      <Route path="/missions/jordan" component={MissionJordan} />
      <Route path="/missions" component={Missions} />
      <Route path="/pastor-chat" component={PastorChat} />
      <Route path="/bible-buddy" component={PastorChat} />
      <Route path="/notes" component={Notes} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/native-auth-callback" component={NativeAuthCallback} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      <Route path="/admin/ethiopian-bible" component={AdminEthiopianBible} />
      <Route path="/ambassador" component={AmbassadorPage} />
      <Route path="/ambassador/pending">{() => <Redirect to="/ambassador" />}</Route>
      <Route path="/ambassador/dashboard">{() => <Redirect to="/ambassador" />}</Route>
      <Route path="/admin" component={AdminPanel} />
      <Route path="/email-preview" component={EmailPreview} />
      <Route path="/prayer-timer" component={PrayerTimer} />
      <Route path="/prayer-requests" component={PrayerRequests} />
      <Route path="/vagabond-bible" component={VagabondBible} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const isVagabond = isVagabondBibleDomain();
  return isVagabond ? <VagabondBibleRouter /> : <ChurchRouter />;
}

function DeepLinkHandler() {
  useDeepLinks();
  return null;
}

function ReferralHandler() {
  useReferralCapture();
  return null;
}

function PushNotificationsHandler() {
  const { user } = useAuth();
  usePushNotifications(user?.id);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <RevenueCatProvider>
          <PrayerAudioProvider>
            <TooltipProvider>
              <DynamicHead />
              <ScrollToTop />
              <DeepLinkHandler />
              <ReferralHandler />
              <PushNotificationsHandler />
              <Toaster />
              <OfflineBanner />
              <Router />
              <NativeTabBar />
              <FloatingPrayerButton />
              <PlatformToggle />
            </TooltipProvider>
          </PrayerAudioProvider>
        </RevenueCatProvider>
      </PlatformProvider>
    </QueryClientProvider>
  );
}

export default App;
