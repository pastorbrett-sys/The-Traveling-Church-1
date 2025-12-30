import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
