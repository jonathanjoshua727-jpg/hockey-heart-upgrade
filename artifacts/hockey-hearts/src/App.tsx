import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Mission from '@/pages/Mission';
import Vision from '@/pages/Vision';
import Campaigns from '@/pages/Campaigns';
import CampaignDetail from '@/pages/CampaignDetail';
import Donate from '@/pages/Donate';
import Impact from '@/pages/Impact';
import News from '@/pages/News';
import NewsArticle from '@/pages/NewsArticle';
import Contact from '@/pages/Contact';
import Faq from '@/pages/Faq';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const queryClient = new QueryClient();

// Scroll to top on route change
function ScrollToTop() {
  const [pathname] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public pages */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/mission" component={Mission} />
        <Route path="/vision" component={Vision} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/campaigns/:slug" component={CampaignDetail} />
        <Route path="/donate" component={Donate} />
        <Route path="/impact" component={Impact} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug" component={NewsArticle} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={Faq} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />

        {/* Admin */}
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
