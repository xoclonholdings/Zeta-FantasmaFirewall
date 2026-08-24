import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";

import { Toaster } from "@/components/ui/toaster";
import AdminPanel from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import FAQ from "@/pages/faq";
import HowTo from "@/pages/how-to";
import HowToDetail from "@/pages/how-to-detail";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import IntegrityDesk from "@/pages/integrity-desk";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

function LegacyRedirect({ to }: { to: string }) { const [, navigate] = useLocation(); useEffect(() => navigate(to, { replace: true }), [navigate, to]); return null; }

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/control/integrity/:surface" component={IntegrityDesk} />
        <Route path="/faq" component={FAQ} />
        <Route path="/how-to" component={HowTo} />
        <Route path="/how-to/:id" component={HowToDetail} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/threat-reports"><LegacyRedirect to="/control/integrity/logs" /></Route>
        <Route path="/system-metrics"><LegacyRedirect to="/control/integrity/monitoring" /></Route>
        <Route path="/quantum-encryption"><LegacyRedirect to="/control/integrity/diagnostics" /></Route>
        <Route path="/emergency-protocols"><LegacyRedirect to="/control/integrity/diagnostics" /></Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}
