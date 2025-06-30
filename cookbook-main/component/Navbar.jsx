import { Link } from 'react-router-dom';
import { useState } from 'react';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Clear session storage to show welcome animation after next login
    sessionStorage.removeItem('hasSeenWelcome');
    window.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/?fromNavbar=true" className="text-2xl font-extrabold tracking-wide flex items-center gap-1 select-none" style={{ fontFamily: 'Bebas Neue, Montserrat, Orbitron, Arial, sans-serif', letterSpacing: '0.08em' }}>
              <span className="text-blue-500">Cook</span><span className="text-green-400">Book</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/?fromNavbar=true" 
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              🏠 Home
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/fav" 
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  ❤️ Favorites
                </Link>
                <Link 
                  to="/my-recipes" 
                  className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  📝 My Recipes
                </Link>
                <Link 
                  to="/add" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  ➕ Create Recipe
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-green-400 focus:outline-none focus:text-green-400"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 rounded-lg mt-2">
              <Link 
                to="/?fromNavbar=true" 
                className="text-gray-300 hover:text-green-400 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/fav" 
                    className="text-gray-300 hover:text-green-400 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ❤️ Favorites
                  </Link>
                  <Link 
                    to="/my-recipes" 
                    className="text-gray-300 hover:text-green-400 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📝 My Recipes
                  </Link>
                  <Link 
                    to="/add" 
                    className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ➕ Create Recipe
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-gray-300 hover:text-red-400 block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};