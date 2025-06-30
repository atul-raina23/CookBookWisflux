const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Validation middleware
const validateCreateRecipe = [
  body('name').trim().isLength({ min: 1 }).withMessage('Recipe name is required'),
  body('instructions').trim().isLength({ min: 1 }).withMessage('Instructions are required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('thumbnail').optional().trim().custom((value) => {
    if (value && value.trim() !== '') {
      // Accept both regular URLs and base64 data URLs
      const urlPattern = /^https?:\/\/.+/;
      const base64Pattern = /^data:image\/[a-zA-Z]+;base64,/;
      
      if (!urlPattern.test(value) && !base64Pattern.test(value)) {
        throw new Error('Thumbnail must be a valid URL or base64 image data');
      }
    }
    return true;
  }).withMessage('Thumbnail must be a valid URL or base64 image data')
];

const validateUpdateRecipe = [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Recipe name cannot be empty'),
  body('instructions').optional().trim().isLength({ min: 1 }).withMessage('Instructions cannot be empty'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('thumbnail').optional().isURL().withMessage('Thumbnail must be a valid URL')
];

// Create recipe endpoint
router.post('/', authenticateToken, validateCreateRecipe, async (req, res) => {
  try {
    const { name, instructions, thumbnail, ingredients } = req.body;
    const userId = req.user.id;

    // Create recipe
    const createRecipeQuery = `
      INSERT INTO recipes (name, instructions, thumbnail, ingredients, posted_by_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, name, instructions, thumbnail, ingredients, posted_at, posted_by_id
    `;
    
    const result = await pool.query(createRecipeQuery, [
      name, 
      instructions, 
      thumbnail || null, 
      ingredients || [], 
      userId
    ]);

    const recipe = result.rows[0];

    res.status(201).json({
      status: 'success',
      message: 'Recipe created successfully',
      data: { recipe }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create recipe',
      details: error.message
    });
  }
});

// Get all recipes with search and pagination
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.id, r.name, r.instructions, r.thumbnail, r.ingredients, 
             r.posted_at, r.posted_by_id, u.name as posted_by_name
      FROM recipes r
      JOIN users u ON r.posted_by_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM recipes r';
    let queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (search && search.trim()) {
      paramCount++;
      const searchCondition = `WHERE r.name ILIKE $${paramCount}`;
      query += ` ${searchCondition}`;
      countQuery += ` ${searchCondition}`;
      queryParams.push(`%${search.trim()}%`);
    }

    // Add ordering and pagination
    query += ` ORDER BY r.posted_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    // Execute queries
    const [recipesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, search && search.trim() ? [`%${search.trim()}%`] : [])
    ]);

    const recipes = recipesResult.rows;
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Convert ingredients from string to array
    const recipesWithArrayIngredients = recipes.map(recipe => ({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (recipe.ingredients ? recipe.ingredients.split(',').map(i => i.trim()) : [])
    }));

    res.json({
      status: 'success',
      data: {
        recipes: recipesWithArrayIngredients,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recipes'
    });
  }
});

// Get user's own recipes
router.get('/user/my-recipes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT id, name, instructions, thumbnail, ingredients, posted_at, posted_by_id
      FROM recipes 
      WHERE posted_by_id = $1 
      ORDER BY posted_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, parseInt(limit), offset]);
    
    // Convert ingredients from string to array
    const recipesWithArrayIngredients = result.rows.map(recipe => ({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (recipe.ingredients ? recipe.ingredients.split(',').map(i => i.trim()) : [])
    }));

    res.json({
      status: 'success',
      data: {
        recipes: recipesWithArrayIngredients
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your recipes'
    });
  }
});

// Get recipes by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.id, r.name, r.instructions, r.thumbnail, r.ingredients, 
             r.posted_at, r.posted_by_id, u.name as posted_by_name
      FROM recipes r
      JOIN users u ON r.posted_by_id = u.id
      WHERE r.posted_by_id = $1 
      ORDER BY r.posted_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, parseInt(limit), offset]);

    res.json({
      status: 'success',
      data: {
        recipes: result.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user recipes'
    });
  }
});

// Search recipes by name
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const searchQuery = `
      SELECT r.id, r.name, r.instructions, r.thumbnail, r.ingredients, 
             r.posted_at, r.posted_by_id, u.name as posted_by_name
      FROM recipes r
      JOIN users u ON r.posted_by_id = u.id
      WHERE r.name ILIKE $1 
      ORDER BY r.posted_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(searchQuery, [`%${query}%`, parseInt(limit), offset]);

    res.json({
      status: 'success',
      data: {
        recipes: result.rows,
        searchQuery: query
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to search recipes'
    });
  }
});

// Get recipe count
router.get('/count/total', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM recipes');
    const count = parseInt(result.rows[0].count);

    res.json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recipe count'
    });
  }
});

// Get single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT r.id, r.name, r.instructions, r.thumbnail, r.ingredients, 
             r.posted_at, r.posted_by_id, u.name as posted_by_name
      FROM recipes r
      JOIN users u ON r.posted_by_id = u.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        recipe: result.rows[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recipe'
    });
  }
});

// Update recipe endpoint
router.put('/:id', authenticateToken, validateUpdateRecipe, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, instructions, thumbnail, ingredients } = req.body;
    const userId = req.user.id;

    // Check if recipe exists and belongs to user
    const checkQuery = 'SELECT id, posted_by_id FROM recipes WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    if (checkResult.rows[0].posted_by_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own recipes'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
    }

    if (instructions !== undefined) {
      paramCount++;
      updateFields.push(`instructions = $${paramCount}`);
      updateValues.push(instructions);
    }

    if (thumbnail !== undefined) {
      paramCount++;
      updateFields.push(`thumbnail = $${paramCount}`);
      updateValues.push(thumbnail);
    }

    if (ingredients !== undefined) {
      paramCount++;
      updateFields.push(`ingredients = $${paramCount}`);
      updateValues.push(ingredients);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE recipes 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, name, instructions, thumbnail, ingredients, posted_at, posted_by_id
    `;

    const result = await pool.query(updateQuery, updateValues);

    res.json({
      status: 'success',
      message: 'Recipe updated successfully',
      data: {
        recipe: result.rows[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update recipe'
    });
  }
});

// Delete recipe endpoint
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if recipe exists and belongs to user
    const checkQuery = 'SELECT id, posted_by_id FROM recipes WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    if (checkResult.rows[0].posted_by_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own recipes'
      });
    }

    // Delete recipe (cascade will handle favorites)
    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);

    res.json({
      status: 'success',
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete recipe'
    });
  }
});

module.exports = router; 