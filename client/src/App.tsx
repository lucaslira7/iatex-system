import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import LandingPage from "@/pages/LandingPage";
import DemoPage from "@/pages/DemoPage";
import LeadCapture from "@/pages/LeadCapture";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { pwaManager } from "@/utils/pwa";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/teste-gratis" component={LeadCapture} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Inicializar PWA quando app carrega
    if (typeof window !== 'undefined') {
      pwaManager;
    }
  }, []);

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
