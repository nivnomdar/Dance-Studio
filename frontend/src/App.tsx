// ... existing code ...
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DeveloperCredit from './components/layout/DeveloperCredit';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AuthCallback from './pages/AuthCallback';
import ClassDetailPage from './components/ClassDetailPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { PopupProvider } from './contexts/PopupContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassesReportsWrapper from './pages/admin/ClassesReportsWrapper';
// import { ThrottleMonitor } from './components/ThrottleMonitor';

function AppContent() {
  const location = useLocation();
  
  // Check if current path is admin dashboard
  const isAdminPath = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="pt-12 flex-grow"> {/* Add padding-top to account for fixed navbar */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/class/:slug" element={<ClassDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/classes-reports" element={<ClassesReportsWrapper />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </main>
      {!isAdminPath ? <Footer /> : <DeveloperCredit />}
    </div>
  );
}

function App() {
  // console.log('App component render at:', new Date().toISOString()); // Debug log
  return (
    <AuthProvider>
      <PopupProvider>
        <CartProvider>
          <Router>
            <AppContent />
            {/* <ThrottleMonitor isVisible={import.meta.env.DEV} /> */}
          </Router>
        </CartProvider>
      </PopupProvider>
    </AuthProvider>
  );
}

export default App;
