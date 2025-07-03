import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AuthCallback from './pages/AuthCallback';
import TrialClassPage from './pages/TrialClassPage';
import SingleClassPage from './pages/SingleClassPage';
import { PopupProvider } from './contexts/PopupContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  // const handleInstagram = () => {
  //   console.log("Clicked");
  // };

  return (
    <PopupProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-black">
            <Navbar />
            <main className="pt-12"> {/* Add padding-top to account for fixed navbar */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/trial-class" element={<TrialClassPage />} />
                <Route path="/single-class" element={<SingleClassPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </PopupProvider>
  );
}

export default App;
