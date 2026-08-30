import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ContactPage from './pages/ContactPage';
import TrackOrderPage from './pages/TrackOrderPage';

// Analytics
import { initAnalytics, trackPageView } from './lib/analytics';

function ScrollToTop() {
  const { pathname } = useLocation();
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  return null;
}

function AnalyticsPageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isLoginPage && <AnnouncementBar />}
      <Header />
      <ScrollToTop />
      <AnalyticsPageTracker />
      <main className="flex-1 pb-20 lg:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          {/* Short shareable product link for reels/comments — backend resolves slug or id */}
          <Route path="/p/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: { primary: '#0284c7', secondary: '#fff' },
              },
            }}
          />
          <AppLayout />
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
