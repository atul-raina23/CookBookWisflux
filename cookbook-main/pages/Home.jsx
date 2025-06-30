import { useEffect, useState, useCallback, useMemo } from 'react';
import { AllRecipes } from '../component/AllRecipes';
import SearchBar from '../component/SerachBar';
import { Link, useLocation } from "react-router-dom";
import { apiService } from '../src/api';
// import heroImage from './bgg.png';
// import homeBg from './homepic.jpg';
import bgGood from './bgGood.jpg';
import { useNavigate } from 'react-router-dom';

// SVG Food Icons (modern, flat style)
const FOOD_ICONS = [
  // Pizza
  <svg key="pizza" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><path d="M12 2C7.03 2 2.73 5.11 1 10.5c2.5 1.5 6.5 2.5 11 2.5s8.5-1 11-2.5C21.27 5.11 16.97 2 12 2Z" fill="#F9D923"/><path d="M12 13c-4.5 0-8.5-1-11-2.5C2.73 18.89 7.03 22 12 22s9.27-3.11 11-8.5C20.5 12 16.5 13 12 13Z" fill="#F4A259"/><circle cx="8.5" cy="8.5" r="1.5" fill="#D7263D"/><circle cx="15.5" cy="10.5" r="1.5" fill="#D7263D"/><circle cx="12" cy="16" r="1.5" fill="#D7263D"/></svg>,
  // Cake
  <svg key="cake" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><rect x="3" y="10" width="18" height="8" rx="2" fill="#F9D923"/><rect x="3" y="14" width="18" height="4" rx="2" fill="#F4A259"/><rect x="7" y="6" width="10" height="4" rx="2" fill="#F9D923"/><circle cx="12" cy="6" r="2" fill="#D7263D"/></svg>,
  // Salad
  <svg key="salad" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="17" rx="8" ry="3" fill="#A0C55F"/><ellipse cx="12" cy="14" rx="6" ry="2.5" fill="#F9D923"/><ellipse cx="12" cy="11" rx="4" ry="2" fill="#F4A259"/></svg>,
  // Sushi
  <svg key="sushi" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="4" fill="#fff"/><ellipse cx="12" cy="12" rx="6" ry="2.5" fill="#F9D923"/><rect x="6" y="10" width="12" height="4" rx="2" fill="#D7263D"/></svg>,
  // Burger
  <svg key="burger" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><rect x="4" y="14" width="16" height="4" rx="2" fill="#F9D923"/><rect x="4" y="10" width="16" height="4" rx="2" fill="#A0C55F"/><rect x="4" y="6" width="16" height="4" rx="2" fill="#F4A259"/></svg>,
  // Ice Cream
  <svg key="icecream" className="w-10 h-10" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="10" rx="6" ry="4" fill="#fff"/><rect x="9" y="10" width="6" height="8" rx="3" fill="#F9D923"/><ellipse cx="12" cy="10" rx="4" ry="2" fill="#D7263D"/></svg>,
];

// Google Fonts import for Poppins ExtraBold
const poppinsFontLink = document.createElement('link');
poppinsFontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@800&display=swap';
poppinsFontLink.rel = 'stylesheet';
document.head.appendChild(poppinsFontLink);

// Google Fonts import for Bebas Neue (or Orbitron)
const bebasFontLink = document.createElement('link');
bebasFontLink.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
bebasFontLink.rel = 'stylesheet';
document.head.appendChild(bebasFontLink);

// Welcome Animation Component
const WelcomeAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 2000);

    // Complete animation after 4.5 seconds
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800">
      <style jsx>{`
        @keyframes fadeUpOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.1);
          }
        }
        .animate-fade-up-out {
          animation: fadeUpOut 2.5s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounceIn 1s ease-out;
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4);
        }
        .codehelp-gradient {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #1e3a8a 100%);
        }
      `}</style>
      
      <div className={`text-center animate-bounce-in ${
        isAnimating ? 'animate-fade-up-out' : ''
      }`}>
        <h1 className="text-8xl font-extrabold mb-6 text-glow" style={{
          fontFamily: 'Bebas Neue, Montserrat, Orbitron, Arial, sans-serif',
          letterSpacing: '0.1em',
          background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.4)'
        }}>
          CookBook
        </h1>
        <p className="text-2xl font-medium drop-shadow-lg mb-4 text-glow" style={{
          background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4)'
        }}>
          Welcome back to your culinary journey! 👨‍🍳
        </p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

// Animated subtitle component
const AnimatedSubtitle = () => {
  const [currentText, setCurrentText] = useState(0);
  const subtitles = [
    "Discover Delicious Recipes",
    "Create Your Own Masterpieces", 
    "Share Your Culinary Passion",
    "Explore Global Cuisines"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-500 ease-in-out" style={{
      background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }}>
      {subtitles[currentText]}
    </h2>
  );
};

// Simple food icons row
const AnimatedFoodIcons = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-6 mb-0">
      {FOOD_ICONS.map((icon, i) => (
        <span key={i} className="inline-block">
          {icon}
        </span>
      ))}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [forkifyRecipes, setForkifyRecipes] = useState([]);
  const [loadingForkify, setLoadingForkify] = useState(false);
  const [forkifyError, setForkifyError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [showSearchHeading, setShowSearchHeading] = useState(false);
  const [availableQueries, setAvailableQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const location = useLocation();
  
  // Check if user is logged in
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  
  // Check if coming from navbar (home icon click)
  const isFromNavbar = new URLSearchParams(location.search).get('fromNavbar') === 'true';
  
  // Clean up URL parameter if present
  useEffect(() => {
    if (isFromNavbar) {
      // Remove the fromNavbar parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isFromNavbar]);
  
  // Show welcome animation only if user is logged in AND not coming from navbar
  useEffect(() => {
    if (isLoggedIn && !isFromNavbar) {
      setShowWelcomeAnimation(true);
    }
  }, [isLoggedIn, isFromNavbar]);

  // Fetch available queries on component mount
  useEffect(() => {
    const fetchAvailableQueries = async () => {
      try {
        setLoadingQueries(true);
        const queries = await apiService.getAvailableQueries();
        setAvailableQueries(queries);
      } catch (error) {
        // No fallback - let user search anyway
        setAvailableQueries([]);
      } finally {
        setLoadingQueries(false);
      }
    };

    fetchAvailableQueries();
  }, []);

  // Fetch user recipes with better error handling
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await apiService.getAllRecipes();
        
        // Handle the API response structure: { status: "success", data: { recipes: [], total: 0, ... } }
        if (res.data && res.data.status === 'success' && res.data.data && res.data.data.recipes) {
          setRecipes(res.data.data.recipes);
          setFiltered(res.data.data.recipes);
        } 
        // Handle simple array response: { status: "success", data: [] }
        else if (res.data && res.data.status === 'success' && Array.isArray(res.data.data)) {
          setRecipes(res.data.data);
          setFiltered(res.data.data);
        }
        // Handle direct array response
        else if (Array.isArray(res.data)) {
          setRecipes(res.data);
          setFiltered(res.data);
        }
        else {
          setRecipes([]);
          setFiltered([]);
        }
      } catch (err) {
        // Don't set error for 401 - just show empty state
        if (err.response?.status === 401) {
          setRecipes([]);
          setFiltered([]);
        } else {
          setError('Failed to load recipes. Please try again later.');
          setRecipes([]);
          setFiltered([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Clear search and show all recipes
  const clearSearch = () => {
    setSearchQuery('');
    setForkifyRecipes([]);
    setForkifyError('');
    setFiltered(recipes); // Show all local recipes
  };

  // Enhanced search handler with dynamic queries - combines Forkify and local database
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setShowSearchHeading(true);
    setTimeout(() => setShowSearchHeading(false), 2000);
    setForkifyError('');
    setForkifyRecipes([]);
    
    // Search both Forkify API and local database simultaneously
    setLoadingForkify(true);
    
    try {
      // 1. Search local database first (faster)
      const localResults = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query.toLowerCase())
      );
      
      // 2. Search Forkify API
      let forkifyResults = [];
      try {
        const res = await apiService.searchForkifyDirect(query);
        
        // Handle different response formats from backend
        let recipes = [];
        
        // Format 1: Backend returns { recipes: [...] }
        if (res.data && res.data.recipes && Array.isArray(res.data.recipes)) {
          recipes = res.data.recipes;
        }
        // Format 2: Backend returns { data: { recipes: [...] } }
        else if (res.data && res.data.data && res.data.data.recipes && Array.isArray(res.data.data.recipes)) {
          recipes = res.data.data.recipes;
        }
        // Format 3: Backend returns { data: [...] }
        else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          recipes = res.data.data;
        }
        
        if (recipes.length > 0) {
          // Map Forkify recipes to our card format
          forkifyResults = recipes
            .filter(r => r.image_url && r.image_url.trim() !== '') // Only include recipes with valid images
            .map(r => ({
              id: r.recipe_id || r.id || `forkify-${Math.random()}`, // Use recipe_id from v1 API or id from v2
              name: r.title,
              thumbnail: r.image_url,
              postedAt: new Date().toISOString(),
              postedBy: { name: r.publisher, id: 'forkify' },
              ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
              instructions: '',
              source: 'forkify' // Mark as external recipe
            }));
        }
      } catch (forkifyError) {
        // Continue with local results only
      }
      
      // 3. Combine results - local recipes first, then Forkify recipes
      const combinedResults = [
        ...localResults.map(recipe => ({ ...recipe, source: 'local' })), // Mark as local recipe
        ...forkifyResults
      ];
      
      if (combinedResults.length > 0) {
        setForkifyRecipes(combinedResults);
        setFiltered([]); // Clear filtered to show combined results
      } else {
        setForkifyError('No recipes found for this search. Try a different term.');
        setFiltered([]);
      }
      
    } catch (err) {
      // Fallback to local search only
      const filteredData = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(filteredData);
      if (filteredData.length === 0) {
        setForkifyError('Error fetching recipes. Please try again.');
      }
    } finally {
      setLoadingForkify(false);
    }
  }, [recipes]);

  // Show recipes from database (no more hardcoded demo recipes)
  const recipesToShow = useMemo(() => {
    if (searchQuery) {
      return filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered; // Return only database recipes
  }, [filtered, searchQuery]);

  // If Forkify recipes are present, show them instead
  const showForkify = forkifyRecipes.length > 0 || loadingForkify || forkifyError;

  // Loading timeout for better UX
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoadingTimeout(true), 5000); // 5 seconds
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Handle welcome animation completion
  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
  };

  // Combine Forkify available queries and local recipe names for suggestions
  const combinedSuggestions = useMemo(() => {
    const localNames = recipes.map(r => r.name).filter(Boolean);
    const forkifyNames = Array.isArray(availableQueries) ? availableQueries : [];
    // Remove duplicates and sort
    return Array.from(new Set([...localNames, ...forkifyNames])).sort((a, b) => a.localeCompare(b));
  }, [recipes, availableQueries]);

  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-red-400 text-lg mb-4">Loading is taking too long. Please check your connection or try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your cookbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcomeAnimation && (
        <WelcomeAnimation onComplete={handleWelcomeComplete} />
      )}
      
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          backgroundImage: `url(${bgGood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        {/* Professional overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30 z-0" />
        
        <main className="container mx-auto px-6 py-8 relative z-10">
          {/* Hero Section with Professional Styling */}
          <div className="text-center mb-12 mt-12">
            <div className="mb-8">
              <AnimatedSubtitle />
            </div>
            <AnimatedFoodIcons />
          </div>

          {/* Professional Search Section */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search your recipes & external recipes (e.g., pizza, cake, chicken)..." 
                suggestions={combinedSuggestions}
                loading={loadingQueries}
              />
            </div>
          </div>

          {/* Content Section with Professional Styling */}
          {showForkify ? (
            <div className="space-y-8">
              {loadingForkify && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
                  <p className="text-white text-xl font-medium">Searching for delicious recipes...</p>
                  <p className="text-gray-300 text-sm mt-2">Please wait while we find the best recipes for you</p>
                </div>
              )}
              {forkifyError && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">🔍</div>
                  <p className="text-red-400 text-xl font-medium mb-3">{forkifyError}</p>
                  <p className="text-gray-300 text-sm mb-4">Try searching for: pizza, cake, chicken, pasta, sushi</p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    ✕ Clear Search & Show All Recipes
                  </button>
                </div>
              )}
              {forkifyRecipes.length > 0 && (
                <div>
                  {showSearchHeading && searchQuery && (
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                        Search Results for "{searchQuery}"
                      </h2>
                      <div className="flex justify-center items-center gap-4 text-sm text-gray-300 mb-4">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span>Your Recipes</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span>External Recipes</span>
                        </span>
                      </div>
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors duration-200"
                      >
                        ✕ Clear Search
                      </button>
                    </div>
                  )}
                  <AllRecipes recipes={forkifyRecipes} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {recipesToShow.length > 0 ? (
                <div>
                  <AllRecipes recipes={recipesToShow} />
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">🍽️</div>
                  <p className="text-white text-xl font-medium mb-3 drop-shadow-lg">No recipes found</p>
                  <p className="text-gray-300 text-sm drop-shadow-md">Try searching for something else or add your own recipes!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
