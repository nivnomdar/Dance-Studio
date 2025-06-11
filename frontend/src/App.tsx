import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import ShopPage from './pages/ShopPage';
import AuthCallback from './pages/AuthCallback';
import { PopupProvider } from './contexts/PopupContext';

function App() {
  // const handleInstagram = () => {
  //   console.log("Clicked");
  // };

  return (
    <PopupProvider>
    <Router>
      <div className="min-h-screen bg-[#FDF9F6]">
        <Navbar />
        <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
      </div>
    </Router>
    </PopupProvider>
  );
}

export default App;
