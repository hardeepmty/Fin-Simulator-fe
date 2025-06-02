
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";
import { GamesProvider } from '@/context/GamesContext';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Marketplace from "./pages/Marketplace";
import Betting from "./pages/Betting";
import Loans from "./pages/Loans";
import Leaderboards from "./pages/Leaderboards";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GamesHub from "./pages/GamesHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SimulationProvider>
         <GamesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/betting" element={<Betting />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
             <Route path="/games" element={<GamesHub />} />
            <Route path="/login" element={<Login />} />
            <Route path= "/signup" element={<Signup/>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </GamesProvider>
      </SimulationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
