import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to clear token
export const clearToken = () => {
  localStorage.removeItem('token');
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRequest =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/signup');

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service wrapper
export const apiService = {
  // Auth endpoints
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/user/profile'),
  
  // Recipe endpoints (matching backend exactly)
  getAllRecipes: () => api.get('/recipe'),
  getRecipeById: (id) => api.get(`/recipe/${id}`),
  createRecipe: (data) => api.post('/recipe', data),
  updateRecipe: (id, data) => api.put(`/recipe/${id}`, data),
  deleteRecipe: (id) => api.delete(`/recipe/${id}`),
  getMyRecipes: () => api.get('/recipe/user/my-recipes'),
  searchRecipes: (query) => api.get(`/recipe/search/${query}`),
  
  // Favorite endpoints (matching backend exactly)
  getFavorites: () => api.get('/favorite'),
  addToFavorites: (recipeId) => api.post(`/favorite/${recipeId}`),
  removeFromFavorites: (recipeId) => api.delete(`/favorite/${recipeId}`),
  checkFavoriteStatus: (recipeId) => api.get(`/favorite/check/${recipeId}`),
  toggleFavorite: (recipeId) => api.post(`/favorite/toggle/${recipeId}`),
  
  // Forkify API (external) - using backend proxy
  searchForkify: (query) => api.get(`/forkify/search?q=${encodeURIComponent(query)}`),
  getForkifyRecipe: (rId) => api.get(`/forkify/get?rId=${encodeURIComponent(rId)}`),
  getForkifySuggestions: (query) => api.get(`/forkify/search?q=${encodeURIComponent(query)}`),
  
  // NEW: Dynamic available queries from Forkify API via backend
  getAvailableQueries: async () => {
    try {
      const response = await api.get('/forkify/search?q=pizza');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // NEW: Search Forkify via backend proxy
  searchForkifyDirect: async (query) => {
    try {
      const response = await api.get(`/forkify/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Simple cache for API responses
  suggestionCache: new Map(),
  
  // NEW: Get suggestions for recipe name input
  getRecipeNameSuggestions: async (query) => {
    try {
      if (query.trim().length < 2) return [];
      
      // Check cache first
      const cacheKey = query.toLowerCase().trim();
      if (apiService.suggestionCache.has(cacheKey)) {
        return apiService.suggestionCache.get(cacheKey);
      }
      
      // Available search queries from Forkify API
      const availableQueries = [
        'carrot', 'broccoli', 'asparagus', 'cauliflower', 'corn', 'cucumber', 'green pepper',
        'lettuce', 'mushrooms', 'onion', 'potato', 'pumpkin', 'red pepper', 'tomato',
        'beetroot', 'brussel sprouts', 'peas', 'zucchini', 'radish', 'sweet potato',
        'artichoke', 'leek', 'cabbage', 'celery', 'chili', 'garlic', 'basil', 'coriander',
        'parsley', 'dill', 'rosemary', 'oregano', 'cinnamon', 'saffron', 'green bean',
        'bean', 'chickpea', 'lentil', 'apple', 'apricot', 'avocado', 'banana', 'blackberry',
        'blackcurrant', 'blueberry', 'boysenberry', 'cherry', 'coconut', 'fig', 'grape',
        'grapefruit', 'kiwifruit', 'lemon', 'lime', 'lychee', 'mandarin', 'mango', 'melon',
        'nectarine', 'orange', 'papaya', 'passion fruit', 'peach', 'pear', 'pineapple',
        'plum', 'pomegranate', 'quince', 'raspberry', 'strawberry', 'watermelon', 'salad',
        'pizza', 'pasta', 'popcorn', 'lobster', 'steak', 'bbq', 'pudding', 'hamburger',
        'pie', 'cake', 'sausage', 'tacos', 'kebab', 'poutine', 'seafood', 'chips', 'fries',
        'masala', 'paella', 'som tam', 'chicken', 'toast', 'marzipan', 'tofu', 'ketchup',
        'hummus', 'chili', 'maple syrup', 'parma ham', 'fajitas', 'champ', 'lasagna',
        'poke', 'chocolate', 'croissant', 'arepas', 'bunny chow', 'pierogi', 'donuts',
        'rendang', 'sushi', 'ice cream', 'duck', 'curry', 'beef', 'goat', 'lamb', 'turkey',
        'pork', 'fish', 'crab', 'bacon', 'ham', 'pepperoni', 'salami', 'ribs'
      ];

      // Find matching queries from available search terms
      const matchingQueries = availableQueries.filter(term => 
        term.toLowerCase().includes(query.toLowerCase())
      );

      let suggestions = [];

      // If we have exact or close matches from available queries, use them
      if (matchingQueries.length > 0) {
        // Take the first matching query and search for recipes via backend
        const searchQuery = matchingQueries[0];
        
        try {
          const response = await api.get(`/forkify/search?q=${encodeURIComponent(searchQuery)}`);
          
          if (response.data && response.data.recipes) {
            suggestions = response.data.recipes
              .filter(recipe => recipe.title.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map(recipe => ({
                id: recipe.recipe_id,
                title: recipe.title,
                image: recipe.image_url,
                publisher: recipe.publisher
              }));
          }
        } catch (apiError) {
        }
      }

      // Fallback: try with the original query if it's not in the available list
      if (suggestions.length === 0) {
        try {
          const response = await api.get(`/forkify/search?q=${encodeURIComponent(query)}`);
          
          if (response.data && response.data.recipes) {
            suggestions = response.data.recipes
              .slice(0, 5)
              .map(recipe => ({
                id: recipe.recipe_id,
                title: recipe.title,
                image: recipe.image_url,
                publisher: recipe.publisher
              }));
          }
        } catch (fallbackError) {
        }
      }
      
      // Cache the results for 5 minutes
      apiService.suggestionCache.set(cacheKey, suggestions);
      setTimeout(() => {
        apiService.suggestionCache.delete(cacheKey);
      }, 5 * 60 * 1000); // 5 minutes
      
      return suggestions;
    } catch (error) {
      return [];
    }
  }
};
