import { RecipeList } from './RecipeList';
import { Link } from 'react-router-dom';

export const AllRecipes = ({ recipes, loading, error }) => {
  if (loading) return <div className="text-center py-10 text-white">Loading recipes...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (recipes.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-white mb-2">No recipes found</h3>
        <p className="text-gray-300 mb-6">The database is empty. Be the first to create amazing recipes!</p>
        <Link 
          to="/add" 
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Create Your First Recipe
        </Link>
      </div>
    );
  }

  return (
    <div>
      <RecipeList recipes={recipes} title="All Recipes" />
    </div>
  );
};
