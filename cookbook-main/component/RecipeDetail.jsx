// src/pages/RecipeDetail.jsx
import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiService } from '../src/api';

const RecipeDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  // If recipe is passed via navigation (e.g., Forkify/demo), use it directly
  const passedRecipe = location.state?.recipe;
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  // Helper function to process ingredients
  const processIngredients = (ingredients) => {
    if (Array.isArray(ingredients)) {
      return ingredients;
    }
    if (typeof ingredients === 'string' && ingredients.trim()) {
      return ingredients.split(',').map(i => i.trim());
    }
    return [];
  };

  useEffect(() => {
    // If recipe is passed via navigation, process it immediately
    if (passedRecipe) {
      const processedRecipe = {
        ...passedRecipe,
        ingredients: processIngredients(passedRecipe.ingredients)
      };
      setRecipe(processedRecipe);
      return;
    }

    // Only fetch from backend if no recipe was passed (i.e., real DB recipe)
    const fetchRecipe = async () => {
      try {
        const res = await apiService.getRecipeById(id);
        const recipeData = res.data.data || res.data;
        
        // Ensure ingredients is always an array
        const processedRecipe = {
          ...recipeData,
          ingredients: processIngredients(recipeData.ingredients)
        };
        
        setRecipe(processedRecipe);
        setError(null);
      } catch (err) {
        setError('Failed to load recipe. Please try again later.');
        console.error('Failed to load recipe:', err);
      }
    };
    fetchRecipe();
  }, [id, passedRecipe]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 text-center">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!recipe) return <p className="p-4">Loading...</p>;

  // Render the recipe details (either from backend or passed via state)
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Recipe image */}
      <img src={recipe.thumbnail} alt={recipe.name} className="w-full h-64 object-cover rounded" />
      {/* Recipe name */}
      <h1 className="text-3xl font-bold my-4 text-gray-800">{recipe.name}</h1>
      {/* Posted date (if available) */}
      {recipe.postedAt && (
        <p className="text-sm text-gray-500 mb-4">{new Date(recipe.postedAt).toLocaleDateString()}</p>
      )}
      {/* Ingredients */}
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Ingredients:</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        {(recipe.ingredients || []).map((ingredient, idx) => (
          <li key={idx}>{ingredient}</li>
        ))}
      </ul>
      {/* Instructions */}
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Instructions:</h2>
      <div
        className="prose max-w-full text-gray-700"
        dangerouslySetInnerHTML={{ __html: recipe.instructions }}
      />
      {/* Footer with author name */}
      <footer className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
        &copy; {new Date().getFullYear()} Atul Raina
      </footer>
    </div>
  );
};

export default RecipeDetail;
