
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceEditor from "./pages/InvoiceEditor";
import ClientsPage from "./pages/ClientsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { HashRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoice/:id" element={<InvoiceEditor />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
