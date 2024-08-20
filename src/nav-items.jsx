import { Home, Search, Info, BarChart2 } from "lucide-react";
import HomePage from "./pages/Home.jsx";
import SearchPage from "./pages/Search.jsx";
import AboutPage from "./pages/About.jsx";
import ThemeAnalysisPage from "./pages/ThemeAnalysis.jsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <HomePage />,
  },
  {
    title: "Search",
    to: "/search",
    icon: <Search className="h-4 w-4" />,
    page: <SearchPage />,
  },
  {
    title: "Theme Analysis",
    to: "/theme-analysis",
    icon: <BarChart2 className="h-4 w-4" />,
    page: <ThemeAnalysisPage />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Info className="h-4 w-4" />,
    page: <AboutPage />,
  },
];