import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGate } from "@/components/auth-gate";
import { isVagabondBibleDomain } from "@/lib/host-detection";
import { DynamicHead } from "@/components/dynamic-head";
import { PlatformProvider } from "@/contexts/platform-context";
import { RevenueCatProvider } from "@/contexts/revenuecat-context";
import { PlatformToggle } from "@/components/platform-toggle";
import { NativeTabBar } from "@/components/native-tab-bar";
import { OfflineBanner } from "@/components/offline-banner";
import { useDeepLinks } from "@/hooks/use-deep-links";
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
import AdminEthiopianBible from "@/pages/admin-ethiopian-bible";

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
      <Route path="/pastor-chat">{() => <AuthGate><PastorChat /></AuthGate>}</Route>
      <Route path="/bible-buddy">{() => <AuthGate><PastorChat /></AuthGate>}</Route>
      <Route path="/notes">{() => <AuthGate><Notes /></AuthGate>}</Route>
      <Route path="/profile">{() => <AuthGate><Profile /></AuthGate>}</Route>
      <Route path="/login" component={Login} />
      <Route path="/native-auth-callback" component={NativeAuthCallback} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/admin/ethiopian-bible" component={AdminEthiopianBible} />
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
      <Route path="/pastor-chat">{() => <AuthGate><PastorChat /></AuthGate>}</Route>
      <Route path="/bible-buddy">{() => <AuthGate><PastorChat /></AuthGate>}</Route>
      <Route path="/notes">{() => <AuthGate><Notes /></AuthGate>}</Route>
      <Route path="/profile">{() => <AuthGate><Profile /></AuthGate>}</Route>
      <Route path="/login" component={Login} />
      <Route path="/native-auth-callback" component={NativeAuthCallback} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/admin/ethiopian-bible" component={AdminEthiopianBible} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <RevenueCatProvider>
          <TooltipProvider>
            <DynamicHead />
            <ScrollToTop />
            <DeepLinkHandler />
            <Toaster />
            <OfflineBanner />
            <Router />
            <NativeTabBar />
            <PlatformToggle />
          </TooltipProvider>
        </RevenueCatProvider>
      </PlatformProvider>
    </QueryClientProvider>
  );
}

export default App;
