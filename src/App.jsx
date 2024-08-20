import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Navigation from "./components/Navigation";
import SearchResults from "./pages/SearchResults";
import ThemeAnalysis from "./pages/ThemeAnalysis";
import IntroductionDraft from "./pages/IntroductionDraft";
import Project from "./pages/Project";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Navigation />
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/theme-analysis" element={<ThemeAnalysis />} />
          <Route path="/introduction-draft" element={<IntroductionDraft />} />
          <Route path="/project" element={<Project />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;