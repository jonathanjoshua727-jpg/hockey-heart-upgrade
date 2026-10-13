import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useLocation } from 'wouter';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Mission = lazy(() => import('@/pages/Mission'));
const Vision = lazy(() => import('@/pages/Vision'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));
const CampaignDetail = lazy(() => import('@/pages/CampaignDetail'));
const Donate = lazy(() => import('@/pages/Donate'));
const Impact = lazy(() => import('@/pages/Impact'));
const News = lazy(() => import('@/pages/News'));
const NewsArticle = lazy(() => import('@/pages/NewsArticle'));
const Contact = lazy(() => import('@/pages/Contact'));
const Faq = lazy(() => import('@/pages/Faq'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('@/pages/not-found'));

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
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center text-muted-foreground"
            role="status"
          >
            Loading page…
          </div>
        }
      >
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
      </Suspense>
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
