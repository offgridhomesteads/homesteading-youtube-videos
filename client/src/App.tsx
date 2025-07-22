import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import TopicPage from "@/pages/TopicPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/topics/:slug" component={TopicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-navajo-white font-open-sans text-text-gray">
          <Navigation />
          <Router />
          
          {/* Footer */}
          <footer className="bg-dark-blue text-white py-8 mt-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-lora font-bold text-xl mb-4">Homesteading YouTube Videos</h3>
                  <p className="text-gray-300">
                    Your trusted source for curated homesteading videos and sustainable living education.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Popular Topics</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="/topics/organic-gardening" className="hover:text-green-400">Organic Gardening</a></li>
                    <li><a href="/topics/water-harvesting" className="hover:text-green-400">Water Harvesting</a></li>
                    <li><a href="/topics/solar-energy" className="hover:text-green-400">Solar Energy</a></li>
                    <li><a href="/topics/raising-chickens" className="hover:text-green-400">Raising Chickens</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Connect</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-300 hover:text-green-400">
                      <i className="fab fa-facebook text-xl"></i>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-green-400">
                      <i className="fab fa-x-twitter text-xl"></i>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-green-400">
                      <i className="fab fa-instagram text-xl"></i>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-green-400">
                      <i className="fab fa-youtube text-xl"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-600 mt-8 pt-6 text-center text-gray-300">
                <p>&copy; 2025 by <a href="https://AcademyOSR.com/" target="_blank" rel="nofollow">Academy of Self-Reliance</a>. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
