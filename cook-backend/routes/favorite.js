const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all favorite routes
router.use(authenticateToken);

// Add recipe to favorites
router.post('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Check if recipe exists
    const recipeCheck = await pool.query('SELECT id FROM recipes WHERE id = $1', [recipeId]);
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND recipe_id = $2',
      [userId, recipeId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipe is already in your favorites'
      });
    }

    // Add to favorites
    const addFavoriteQuery = `
      INSERT INTO favorites (user_id, recipe_id) 
      VALUES ($1, $2) 
      RETURNING id, created_at
    `;
    const result = await pool.query(addFavoriteQuery, [userId, recipeId]);

    res.status(201).json({
      status: 'success',
      message: 'Recipe added to favorites',
      data: {
        favorite: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add to favorites'
    });
  }
});

// Remove recipe from favorites
router.delete('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Remove from favorites
    const deleteResult = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2 RETURNING id',
      [userId, recipeId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Favorite not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Recipe removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove from favorites'
    });
  }
});

// Get user's favorites
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT f.id as favorite_id, f.created_at as favorited_at,
             r.id, r.name, r.instructions, r.thumbnail, r.ingredients, 
             r.posted_at, r.posted_by_id, u.name as posted_by_name
      FROM favorites f
      JOIN recipes r ON f.recipe_id = r.id
      JOIN users u ON r.posted_by_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, parseInt(limit), offset]);

    res.json({
      status: 'success',
      data: {
        favorites: result.rows
      }
    });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user favorites'
    });
  }
});

// Check if recipe is favorited by user
router.get('/check/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const query = 'SELECT id FROM favorites WHERE user_id = $1 AND recipe_id = $2';
    const result = await pool.query(query, [userId, recipeId]);

    const isFavorited = result.rows.length > 0;

    res.json({
      status: 'success',
      data: {
        isFavorited,
        favoriteId: isFavorited ? result.rows[0].id : null
      }
    });
  } catch (error) {
    console.error('Check favorite status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check favorite status'
    });
  }
});

// Get favorite count for a recipe
router.get('/count/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;

    const query = 'SELECT COUNT(*) FROM favorites WHERE recipe_id = $1';
    const result = await pool.query(query, [recipeId]);

    const count = parseInt(result.rows[0].count);

    res.json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    console.error('Get favorite count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get favorite count'
    });
  }
});

// Toggle favorite status
router.post('/toggle/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Check if recipe exists
    const recipeCheck = await pool.query('SELECT id FROM recipes WHERE id = $1', [recipeId]);
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    // Check current favorite status
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND recipe_id = $2',
      [userId, recipeId]
    );

    let isFavorited;
    let message;

    if (existingFavorite.rows.length > 0) {
      // Remove from favorites
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2',
        [userId, recipeId]
      );
      isFavorited = false;
      message = 'Recipe removed from favorites';
    } else {
      // Add to favorites
      await pool.query(
        'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2)',
        [userId, recipeId]
      );
      isFavorited = true;
      message = 'Recipe added to favorites';
    }

    res.json({
      status: 'success',
      message,
      data: {
        isFavorited
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle favorite'
    });
  }
});

module.exports = router; 