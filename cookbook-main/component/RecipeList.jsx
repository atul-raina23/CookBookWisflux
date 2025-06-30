import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiService } from '../src/api';

// Memoized recipe card for better performance
const RecipeCard = memo(({ recipe, onFavoriteToggle, isFavorite, onDelete, showDeleteButton, isDeleting }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default fallback images for different recipe types
  const getFallbackImage = (recipeName) => {
    const name = recipeName.toLowerCase();
    if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop';
    if (name.includes('cake') || name.includes('dessert')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop';
    if (name.includes('pasta') || name.includes('noodle')) return 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop';
    if (name.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop';
    if (name.includes('sushi')) return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
    if (name.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop';
    if (name.includes('taco')) return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop';
    if (name.includes('biryani') || name.includes('rice')) return 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?w=400&h=300&fit=crop';
    if (name.includes('paneer') || name.includes('curry')) return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop';
    // Default food image
    return 'https://images.unsplash.com/photo-1504674900240-9c9c0b1e6b6b?w=400&h=300&fit=crop';
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Get the image URL with fallback
  const imageUrl = recipe.thumbnail && recipe.thumbnail.trim() !== '' 
    ? recipe.thumbnail 
    : getFallbackImage(recipe.name);

  return (
    <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-3xl flex flex-col border-2 ${
      recipe.source === 'local' ? 'border-green-500' : recipe.source === 'forkify' ? 'border-blue-500' : 'border-gray-800'
    }`}>
      {/* Source indicator */}
      {recipe.source && (
        <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-semibold text-white ${
          recipe.source === 'local' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {recipe.source === 'local' ? '🏠 Your Recipe' : '🌐 External'}
        </div>
      )}
      
      {/* Image with lazy loading and error handling */}
      <div className="relative w-full h-56 bg-gray-200">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🍽️</span>
              <span className="text-gray-600 text-sm">Recipe Image</span>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={recipe.name}
            className={`w-full h-56 object-cover object-center rounded-t-2xl border-b-4 border-gray-800 transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between bg-white/95 backdrop-blur-sm">
        <div>
          <h3 className="font-extrabold text-xl mb-2 text-gray-900 truncate drop-shadow-sm" title={recipe.name}>
            {recipe.name}
          </h3>
          {recipe.postedAt && (
            <h5 className="font-semibold text-xs mb-2 text-gray-600">
              {new Date(recipe.postedAt).toLocaleDateString()}
            </h5>
          )}
          
          {/* Ingredients section */}
          <div className="mb-3">
            <h4 className="font-medium text-sm text-gray-800 mb-1">Ingredients:</h4>
            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
              {Array.isArray(recipe.ingredients) ? (
                <>
                  {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                    <li key={i} className="truncate font-medium">{ingredient}</li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-green-700 font-semibold">+{recipe.ingredients.length - 3} more</li>
                  )}
                </>
              ) : (
                <li className="text-gray-600">No ingredients listed</li>
              )}
            </ul>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-4 space-x-2">
          <button
            onClick={() => onFavoriteToggle(recipe.id)}
            className={`w-8 h-8 text-2xl transition-all duration-300 transform hover:scale-125 ${
              isFavorite ? 'text-red-500' : 'text-gray-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          
          <button
            onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}
            className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold text-xs shadow-lg transition-colors duration-200 border border-green-700"
          >
            👁️ View
          </button>
          
          {showDeleteButton && onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className={`text-white px-4 py-2 rounded-full font-semibold text-xs shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 border ${
                isDeleting 
                  ? 'bg-gray-500 cursor-not-allowed border-gray-600' 
                  : 'bg-red-600 hover:bg-red-700 hover:scale-110 hover:shadow-xl active:scale-95 active:bg-red-800 border-red-700'
              }`}
              disabled={isDeleting}
              title="Delete this recipe"
            >
              {isDeleting ? (
                <span className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-sm">🗑️</span>
                  <span>Delete</span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';

export const RecipeList = ({
  recipes = [],
  title,
  onDelete,
  showDeleteButton = false,
  isDeleting = false,
}) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Normalize recipes data - handle both array and API response format
  const normalizedRecipes = Array.isArray(recipes) 
    ? recipes 
    : (recipes?.data && Array.isArray(recipes.data) ? recipes.data : []);

  // Fetch user's favorites on mount
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!token) {
        //console.log('ℹ No token found, skipping favorites fetch');
        setFavorites([]);
        return;
      }
      
      const res = await apiService.getFavorites();
      console.log(' Favorites API response:', res.data);
      
      // Handle different response formats
      let favoritesData = [];
      if (res.data && res.data.status === 'success' && res.data.data && res.data.data.favorites) {
        // Backend format: { status: "success", data: { favorites: [...] } }
        favoritesData = res.data.data.favorites;
      } else if (Array.isArray(res.data)) {
        // Direct array format
        favoritesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        // Alternative format
        favoritesData = res.data.data;
      }
      
      // Extract recipe IDs from favorites response
      const favIds = favoritesData.map((fav) => fav.id || fav.recipe_id || fav.recipeId || fav.recipe?.id);
      console.log(' Extracted favorite IDs:', favIds);
      setFavorites(favIds);
    } catch (err) {
      console.error(' Failed to fetch favorites:', err);
      // Don't set error for 401 - just show empty favorites
      if (err.response?.status === 401) {
       // console.log('ℹ User not authenticated for favorites, showing empty state');
        setFavorites([]);
      } else {
        setError('Failed to load favorites');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Toggle Favorite API with better error handling
  const handleFavoriteToggle = async (recipeId) => {
    try {
      // Check if user is authenticated
      if (!token) {
        console.log('ℹ No token found, cannot toggle favorite');
        alert('Please login to add favorites');
        return;
      }
      
      console.log(' Toggling favorite for recipe:', recipeId);
      console.log(' Current favorites:', favorites);
      
      if (favorites.includes(recipeId)) {
        console.log('🗑️ Removing from favorites...');
        await apiService.removeFromFavorites(recipeId);
        console.log(' Removed from favorites');
      } else {
        console.log(' Adding to favorites...');
        await apiService.addToFavorites(recipeId);
        console.log(' Added to favorites');
      }
      
      // Refresh favorites list
      await fetchFavorites();
    } catch (err) {
      console.error(' Error toggling favorite:', err);
      
      // Show user-friendly error message
      if (err.response?.status === 401) {
        console.log('ℹ User not authenticated for favorite toggle');
        alert('Please login to manage favorites');
      } else if (err.response?.status === 404) {
        alert('Recipe not found. It may have been deleted.');
      } else if (err.response?.status === 400) {
        alert(err.response.data?.message || 'Cannot add this recipe to favorites');
      } else {
        alert('Failed to update favorites. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-center text-red-500">
          <p>❌ {error}</p>
          <button 
            onClick={fetchFavorites}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {title && (
        <h2 className="text-4xl font-extrabold mb-8 text-center tracking-wide select-none flex flex-col items-center" style={{
          fontFamily: 'Bebas Neue, Montserrat, Orbitron, Arial, sans-serif',
          letterSpacing: '0.08em',
          background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 2px 8px #0002',
        }}>
          <span className="inline-flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" className="inline-block align-middle -mt-1"><ellipse cx="32" cy="32" rx="28" ry="16" fill="#fff" stroke="#d1d5db" strokeWidth="3"/><ellipse cx="32" cy="28" rx="20" ry="10" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/><ellipse cx="32" cy="24" rx="12" ry="6" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5"/><rect x="20" y="38" width="24" height="10" rx="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="2"/></svg>
            Explore Recipes
          </span>
          <span className="block w-16 h-1 mt-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-green-500 opacity-70" />
        </h2>
      )}
      
      {normalizedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-400 text-lg">No recipes found</p>
          <p className="text-gray-500 text-sm mt-2">Try adding some recipes or searching for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {normalizedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={favorites.includes(recipe.id)}
              onDelete={onDelete}
              showDeleteButton={showDeleteButton}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
