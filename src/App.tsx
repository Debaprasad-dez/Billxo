
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceEditor from "./pages/InvoiceEditor";
import ClientsPage from "./pages/ClientsPage";
import RecurringPage from "./pages/RecurringPage";
import SettingsPage from "./pages/SettingsPage";
import ExpensesPage from "./pages/ExpensesPage";
import QuotesPage from "./pages/QuotesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoice/:id" element={<InvoiceEditor />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
