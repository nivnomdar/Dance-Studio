// ... existing code ...
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DeveloperCredit from './components/layout/DeveloperCredit';
// import HomePage from './pages/HomePage'; // Original import
import ClassesPage from './pages/ClassesPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AuthCallback from './pages/AuthCallback';
import ClassDetailPage from './components/ClassDetailPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AccessibilityStatement from './pages/AccessibilityStatement';
import PhysicalAccessibility from './pages/PhysicalAccessibility';
import ProductPage from './pages/ProductPage';
import { PopupProvider } from './contexts/PopupContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { TermsGuard } from './components/TermsGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminDashboard from './admin/pages/dashboard/AdminDashboard';
import ClassesReportsWrapper from './admin/pages/dashboard/ClassesReportsWrapper';
import CookieConsentBanner from './components/layout/CookieConsentBanner';
import NotFoundPage from './pages/NotFoundPage'; // Import NotFoundPage
// import { ThrottleMonitor } from './components/ThrottleMonitor';
import React, { useEffect, Suspense } from 'react'; // Import React, useEffect, and Suspense

const LazyHomePage = React.lazy(() => import('./pages/HomePage')); // Lazy load HomePage
const LazyClassesPage = React.lazy(() => import('./pages/ClassesPage')); // Lazy load ClassesPage
const LazyContactPage = React.lazy(() => import('./pages/ContactPage')); // Lazy load ContactPage
const LazyUserProfile = React.lazy(() => import('./pages/UserProfile')); // Lazy load UserProfile
const LazyShopPage = React.lazy(() => import('./pages/ShopPage')); // Lazy load ShopPage
const LazyCartPage = React.lazy(() => import('./pages/CartPage')); // Lazy load CartPage
const LazyAuthCallback = React.lazy(() => import('./pages/AuthCallback')); // Lazy load AuthCallback
const LazyClassDetailPage = React.lazy(() => import('./components/ClassDetailPage')); // Lazy load ClassDetailPage
const LazyPrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy')); // Lazy load PrivacyPolicy
const LazyTermsOfService = React.lazy(() => import('./pages/TermsOfService')); // Lazy load TermsOfService
const LazyAccessibilityStatement = React.lazy(() => import('./pages/AccessibilityStatement')); // Lazy load AccessibilityStatement
const LazyPhysicalAccessibility = React.lazy(() => import('./pages/PhysicalAccessibility')); // Lazy load PhysicalAccessibility
const LazyProductPage = React.lazy(() => import('./pages/ProductPage')); // Lazy load ProductPage
const LazyAdminDashboard = React.lazy(() => import('./admin/pages/dashboard/AdminDashboard')); // Lazy load AdminDashboard
const LazyClassesReportsWrapper = React.lazy(() => import('./admin/pages/dashboard/ClassesReportsWrapper')); // Lazy load ClassesReportsWrapper
const LazyNotFoundPage = React.lazy(() => import('./pages/NotFoundPage')); // Lazy load NotFoundPage

function AppContent() {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if current path is admin dashboard
  const isAdminPath = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="pt-[100px] flex-grow"> {/* Add padding-top to account for fixed navbar */}
        <Suspense fallback={<div className="text-white text-center py-8">טוען...</div>}>
          <Routes>
            <Route path="/" element={<LazyHomePage />} />
            {/* <Route path="/about" element={<AboutPage />} /> */}
            <Route path="/classes" element={<LazyClassesPage />} />
            <Route path="/class/:slug" element={<LazyClassDetailPage />} />
            <Route path="/contact" element={<LazyContactPage />} />
            <Route path="/profile" element={<LazyUserProfile />} />
            <Route path="/admin" element={<LazyAdminDashboard />} />
            <Route path="/admin/classes-reports" element={<LazyClassesReportsWrapper />} />
            <Route path="/shop" element={<LazyShopPage />} />
            <Route path="/product/:id" element={<LazyProductPage />} />
            <Route path="/cart" element={<LazyCartPage />} />
            <Route path="/auth/v1/callback" element={<LazyAuthCallback />} />
            <Route path="/privacy-policy" element={<LazyPrivacyPolicy />} />
            <Route path="/terms-of-service" element={<LazyTermsOfService />} />
            <Route path="/accessibility-statement" element={<LazyAccessibilityStatement />} />
            <Route path="/physical-accessibility" element={<LazyPhysicalAccessibility />} />
            <Route path="*" element={<LazyNotFoundPage />} /> {/* Catch-all route for 404 */}
          </Routes>
        </Suspense>
      </main>
      {!isAdminPath ? <Footer /> : <DeveloperCredit />}
      <CookieConsentBanner />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <PopupProvider>
            {/* CartProvider should wrap AppContent to ensure useCart is available */}
            <CartProvider>
              <TermsGuard>
                <AppContent />
                {/* <ThrottleMonitor isVisible={import.meta.env.DEV} /> */}
              </TermsGuard>
            </CartProvider>
          </PopupProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
