import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AuthCallback from './pages/AuthCallback';
import ClassDetailPage from './components/ClassDetailPage';
import { PopupProvider } from './contexts/PopupContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassesReportsWrapper from './pages/admin/ClassesReportsWrapper';

function App() {
  return (
    <AuthProvider>
      <PopupProvider>
        <CartProvider>
          <Router>
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
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </PopupProvider>
    </AuthProvider>
  );
}

export default App;
