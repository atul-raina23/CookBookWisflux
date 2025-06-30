import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../src/api';
import { RecipeList } from './RecipeList'; // Your existing recipe card component

const MyRecipes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [myRecipes, setMyRecipes] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user's recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyRecipes();
      
      // Handle different API response structures
      if (res.data && res.data.status === 'success' && Array.isArray(res.data.data.recipes)) {
        setMyRecipes(res.data.data.recipes);
      } else if (res.data && res.data.status === 'success' && Array.isArray(res.data.data)) {
        setMyRecipes(res.data.data);
      } else if (Array.isArray(res.data)) {
        setMyRecipes(res.data);
      } else {
        setMyRecipes([]);
      }
    } catch (error) {
      setMyRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Refresh recipes when navigating to this page
  useEffect(() => {
    if (location.pathname === '/my-recipes') {
      fetchRecipes();
    }
  }, [location.pathname]);

  // Show success message if navigating from CreateRecipe
  useEffect(() => {
    if (location.state?.message) {
      setDeleteMessage(location.state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
      // Clear message after 3 seconds
      setTimeout(() => {
        setDeleteMessage('');
      }, 3000);
    }
  }, [location.state, navigate, location.pathname]);

  // Delete a recipe by id
  const handleDelete = async (id) => {
    if (isDeleting) return; // Prevent multiple clicks
    
    // Show confirmation dialog
    const recipeToDelete = myRecipes.find(recipe => recipe._id === id || recipe.id === id);
    const recipeName = recipeToDelete?.name || 'this recipe';
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${recipeName}"? This action cannot be undone.`
    );
    
    if (!isConfirmed) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeleteMessage('');
      
      await apiService.deleteRecipe(id);
      setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== id && recipe.id !== id));
      
      // Show success message
      setDeleteMessage(` "${recipeName}" deleted!`);
      
      // Clear message after 2 seconds
      setTimeout(() => {
        setDeleteMessage('');
      }, 2000);
      
    } catch (error) {
      setDeleteMessage(` Failed to delete "${recipeName}"`);
      
      // Clear error message after 2 seconds
      setTimeout(() => {
        setDeleteMessage('');
      }, 2000);
    } finally {
      setIsDeleting(false);
    }
  };
    
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <style>{`
        @keyframes bounce-in {
          0% { 
            opacity: 0; 
            transform: scale(0.8) translateY(-10px); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.02) translateY(0); 
          }
          70% { 
            transform: scale(0.98) translateY(0); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8">
  
        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-8 text-center" style={{
          background: 'linear-gradient(90deg, #0ea5e9 20%, #4ade80 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          📝 My Recipes
        </h1>

        {/* Success/Error Message */}
        {deleteMessage && (
          <div className={`mb-3 p-3 rounded text-center text-sm font-medium transition-all duration-300 transform animate-bounce-in ${
            deleteMessage.includes('') || deleteMessage.includes('🎉')
              ? 'bg-green-500 text-white shadow-sm' 
              : 'bg-red-500 text-white shadow-sm'
          }`}>
            {deleteMessage}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your recipes...</p>
          </div>
        )}
        
        {/* Recipe List with Delete buttons */}
        {!loading && myRecipes.length > 0 && (
          <RecipeList
            recipes={myRecipes}
            title=""
            onDelete={handleDelete}
            showDeleteButton={true}
            isDeleting={isDeleting}
          />
        )}

        {/* Empty state if no recipes */}
        {!loading && myRecipes.length === 0 && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-400 text-lg mb-2">No recipes found</p>
            <p className="text-gray-500 text-sm mb-4">You haven't added any recipes yet. Create your first recipe to get started!</p>
            <button 
              onClick={() => navigate('/create-recipe')}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Create Recipe
            </button>
          </div>
        )}
      </div>
    
    </div>
  
  );
};

export default MyRecipes;
