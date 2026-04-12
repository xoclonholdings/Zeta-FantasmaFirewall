import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";

import { Toaster } from "@/components/ui/toaster";
import AdminPanel from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import EmergencyProtocols from "@/pages/emergency-protocols";
import FAQ from "@/pages/faq";
import HowTo from "@/pages/how-to";
import HowToDetail from "@/pages/how-to-detail";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import QuantumEncryption from "@/pages/quantum-encryption";
import SystemMetrics from "@/pages/system-metrics";
import ThreatReports from "@/pages/threat-reports";
import WalletConnect from "@/pages/wallet-connect";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/wallet-connect" component={WalletConnect} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/faq" component={FAQ} />
        <Route path="/how-to" component={HowTo} />
        <Route path="/how-to/:id" component={HowToDetail} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/threat-reports" component={ThreatReports} />
        <Route path="/system-metrics" component={SystemMetrics} />
        <Route path="/quantum-encryption" component={QuantumEncryption} />
        <Route path="/emergency-protocols" component={EmergencyProtocols} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}
