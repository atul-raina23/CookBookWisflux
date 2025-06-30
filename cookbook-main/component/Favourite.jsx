import { useState, useEffect } from 'react';
import { apiService } from '../src/api';
import { RecipeList } from './RecipeList';

export default function Favourite() {
  const token = localStorage.getItem('token');
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getFavorites();
      //console.log(' Fetched favorites response:', res.data);
      
      // Handle different response formats
      let favoritesData = [];
      if (res.data && res.data.status === 'success' && res.data.data && res.data.data.favorites) {
        // Backend format: { status: "success", data: { favorites: [...] } }
        favoritesData = res.data.data.favorites;
        //console.log(' Using backend format favorites:', favoritesData);
      } else if (Array.isArray(res.data)) {
        // Direct array format
        favoritesData = res.data;
        //console.log(' Using direct array format favorites:', favoritesData);
      } else if (res.data && Array.isArray(res.data.data)) {
        // Alternative format
        favoritesData = res.data.data;
        //console.log(' Using alternative format favorites:', favoritesData);
      }
      
      // Extract recipe data from favorites response
      const recipes = favoritesData.map(fav => {
        // Handle different favorite object structures
        if (fav.recipe) {
          return fav.recipe;
        } else if (fav.id && fav.name) {
          // Direct recipe object
          return fav;
        } else {
          console.warn('⚠️ Unknown favorite format:', fav);
          return null;
        }
      }).filter(recipe => recipe !== null);
      
      //console.log(' Extracted recipes from favorites:', recipes);
      setFavorites(recipes);
    } catch (error) {
      //console.error(' Error fetching favorites:', error);
      if (error.response?.status === 401) {
        setError('Please login to view your favorites.');
      } else {
        setError('Failed to load favorites. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    } else {
      setLoading(false);
      setError('Please login to view your favorites.');
    }
  }, [token]);

  // Refresh favorites when component mounts or token changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        fetchFavorites();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <p className="text-xl font-medium">Loading your favorite recipes...</p>
          <p className="text-gray-300 text-sm mt-2">Please wait while we fetch your favorites</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-4">
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold mb-6 text-red-400"> {error}</h2>
          <button 
            onClick={fetchFavorites}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold mb-8 text-center" style={{
          background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          ❤️ My Favorite Recipes
        </h2>
        {favorites.length > 0 ? (
          <RecipeList
            recipes={favorites}
            title="Favorites"
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">💔</div>
            <p className="text-white text-xl font-medium mb-3">No favorite recipes found.</p>
            <p className="text-gray-300 text-sm">Start adding recipes to your favorites by clicking the heart icon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
