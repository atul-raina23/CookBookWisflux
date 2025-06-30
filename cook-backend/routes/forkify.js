const express = require('express');
const axios = require('axios');

const router = express.Router();

// Search recipes from Forkify API
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "q" is required'
      });
    }

    // Try v1 API first (more reliable)
    try {
      const response = await axios.get(
        `https://forkify-api.herokuapp.com/api/search?q=${encodeURIComponent(q.trim())}`
      );

      if (response.data && response.data.recipes && Array.isArray(response.data.recipes)) {
        const transformedRecipes = response.data.recipes.map(recipe => ({
          recipe_id: recipe.recipe_id,
          title: recipe.title,
          image_url: recipe.image_url,
          publisher: recipe.publisher,
          ingredients: recipe.ingredients || []
        }));

        res.json({
          recipes: transformedRecipes
        });
        return;
      } else {
        //console.log(' No recipes found in v1 API response');
      }
    } catch (v1Error) {
      //console.error(' Forkify v1 API failed:', v1Error.message);
    }

    // Fallback to v2 API if v1 fails
    try {
      const v2Response = await axios.get(
        `https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(q.trim())}`
      );

      if (v2Response.data && v2Response.data.data && v2Response.data.data.recipes) {
        const transformedRecipes = v2Response.data.data.recipes.map(recipe => ({
          recipe_id: recipe.id,
          title: recipe.title,
          image_url: recipe.image_url,
          publisher: recipe.publisher,
          ingredients: recipe.ingredients || []
        }));

        res.json({
          recipes: transformedRecipes
        });
        return;
      } else {
        //console.log(' No recipes found in v2 API response');
      }
    } catch (v2Error) {
      //console.error(' Forkify v2 API also failed:', v2Error.message);
    }

    // If both APIs fail, return empty results
    //console.log(' Both APIs failed, returning empty results');
    res.json({ recipes: [] });

  } catch (error) {
    //console.error(' Forkify search error:', error.message);
    //console.error(' Error response:', error.response?.data);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recipes from external API. Please try again later.'
    });
  }
});

// Get recipe details from Forkify API
router.get('/get', async (req, res) => {
  try {
    const { rId } = req.query;

    if (!rId || rId.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Recipe ID parameter "rId" is required'
      });
    }

    // Use Forkify API v1 for consistency
    const response = await axios.get(
      `https://forkify-api.herokuapp.com/api/get?rId=${encodeURIComponent(rId.trim())}`
    );

   // console.log(' Recipe details fetched successfully');

    res.json(response.data);
  } catch (error) {
    //console.error('Forkify get error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recipe details. Please try again later.'
    });
  }
});

module.exports = router; 