import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../src/api';
import QuillEditor from './QuillEditor';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [recipe, setRecipe] = useState({ name: '', instructions: '', thumbnail: '', ingredients: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...recipe,
      ingredients: recipe.ingredients.split(',').map(i => i.trim())
    };

    try {
      const response = await apiService.createRecipe(payload);
      //console.log(' Recipe created successfully:', response.data);
      
      // Show beautiful success message with recipe name
      setSuccessMessage(`"${recipe.name}" has been created successfully! `);
      setShowSuccess(true);
      
      // Reset form
      setRecipe({ name: '', instructions: '', thumbnail: '', ingredients: '' });
      setSuggestions([]);
      
      // Hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 4000);
      
    } catch (err) {
      //console.error(' Error creating recipe:', err);
      alert('Failed to create recipe. Please try again.');
    }
  };

  // Dynamic suggestions using Forkify API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (recipe.name.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setLoadingSuggestions(true);
        const suggestions = await apiService.getRecipeNameSuggestions(recipe.name);
        //console.log(' Recipe name suggestions:', suggestions);
        
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Increased debounce delay to reduce API calls
    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 500); // Increased from 300ms to 500ms

    return () => clearTimeout(delayDebounce);
  }, [recipe.name]);

  const handleSuggestionClick = (suggestion) => {
    setRecipe((prev) => ({ 
      ...prev, 
      name: suggestion.title,
      thumbnail: suggestion.image || prev.thumbnail
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 py-8">
      <style>{`
        @keyframes slideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out animate-slide-in">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border-l-4 border-green-700 flex items-center space-x-3 backdrop-blur-sm animate-pulse">
            <div className="text-2xl animate-bounce">🎉</div>
            <div>
              <div className="font-bold text-lg">Recipe Created!</div>
              <div className="text-sm opacity-90">{successMessage}</div>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-white hover:text-gray-200 ml-4 transition-colors duration-200 hover:scale-110"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-center" style={{
            background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            ➕ Create New Recipe
          </h1>
          <button 
            onClick={() => navigate('/my-recipes')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>←</span>
            Back to My Recipes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create New Recipe</h2>

          {/* Recipe Name with Dynamic Suggestions */}
          <div ref={containerRef} className="relative">
            <label className="text-gray-700 block mb-2 font-medium">Recipe Name *</label>
            <input
              type="text"
              placeholder="Enter recipe name..."
              value={recipe.name}
              onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
              required
              className="p-3 w-full rounded border border-gray-300 text-gray-800 focus:border-blue-500 focus:outline-none"
              onFocus={() => setShowSuggestions(recipe.name.trim().length >= 2 && suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            
            {/* Loading indicator */}
            {loadingSuggestions && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-600"></div>
              </div>
            )}
            
            {/* Dynamic suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white text-gray-800 border border-gray-300 w-full rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.image && (
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.title}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-gray-500">by {suggestion.publisher}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* No suggestions found */}
            {showSuggestions && !loadingSuggestions && suggestions.length === 0 && recipe.name.trim().length >= 2 && (
              <div className="absolute z-10 bg-white text-gray-500 border border-gray-300 w-full rounded mt-1 p-3 text-sm">
                No suggestions found for "{recipe.name}"
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="text-gray-700 block mb-2 font-medium">Instructions *</label>
            <QuillEditor
              value={recipe.instructions}
              onChange={(val) => setRecipe({ ...recipe, instructions: val })}
              placeholder="Write detailed instructions here..."
            />
          </div>

          {/* Thumbnail & Ingredients */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-700 block mb-2 font-medium">Thumbnail URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={recipe.thumbnail}
                onChange={(e) => setRecipe({ ...recipe, thumbnail: e.target.value })}
                className="p-3 w-full rounded border border-gray-300 text-gray-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-2 font-medium">Ingredients *</label>
              <textarea
                placeholder="Enter ingredients separated by commas..."
                value={recipe.ingredients}
                onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value })}
                required
                rows={4}
                className="p-3 w-full rounded border border-gray-300 text-gray-800 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors bg-green-600 hover:bg-green-700"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
