# CookBook Backend - Express.js

A RESTful API for the CookBook application built with Express.js, PostgreSQL, and JWT authentication.

## Features

- User Authentication: Signup, login, logout with JWT tokens
- Recipe Management: Create, read, update, delete recipes
- Favorites System: Add/remove recipes to favorites
- Search Functionality: Search recipes by name
- Forkify Integration: External recipe API integration
- PostgreSQL Database: Robust data storage
- JWT Security: Secure authentication with custom secret

## Tech Stack

- Backend: Express.js
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcrypt
- Validation: express-validator
- HTTP Client: axios (for Forkify API)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd cook-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Update the database configuration and JWT secret

4. Database Setup
   - Create a PostgreSQL database
   - Run the SQL script in `create-tables.sql` to create the required tables

5. Start the server
   ```bash
   # Development mode
   npm run dev
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=Atulpostgres1234
DB_NAME=cookbook_db

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=atul@123

# Environment
NODE_ENV=development
```

## API Endpoints

### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout (requires auth)
- GET /api/auth/me - Get current user (requires auth)

### Recipes
- GET /api/recipe - Get all recipes (with search and pagination)
- POST /api/recipe - Create new recipe (requires auth)
- GET /api/recipe/:id - Get recipe by ID
- PUT /api/recipe/:id - Update recipe (requires auth, owner only)
- DELETE /api/recipe/:id - Delete recipe (requires auth, owner only)
- GET /api/recipe/user/my-recipes - Get user's own recipes (requires auth)
- GET /api/recipe/user/:userId - Get recipes by user ID
- GET /api/recipe/search/:query - Search recipes by name
- GET /api/recipe/count/total - Get total recipe count

### Favorites
- GET /api/favorite - Get user's favorites (requires auth)
- POST /api/favorite/:recipeId - Add recipe to favorites (requires auth)
- DELETE /api/favorite/:recipeId - Remove recipe from favorites (requires auth)
- GET /api/favorite/check/:recipeId - Check if recipe is favorited (requires auth)
- GET /api/favorite/count/:recipeId - Get favorite count for recipe
- POST /api/favorite/toggle/:recipeId - Toggle favorite status (requires auth)

### Forkify API (External)
- GET /api/forkify/search?q=query - Search recipes from Forkify API
- GET /api/forkify/get?rId=id - Get recipe details from Forkify API

### Health Check
- GET /api/health - Server health check

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recipes Table
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    thumbnail VARCHAR(2000),
    ingredients TEXT[],
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

### Favorites Table
```sql
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE(user_id, recipe_id)
);
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

Authorization: Bearer <your-jwt-token>

## Error Handling

All endpoints return consistent error responses:

{
  "status": "error",
  "message": "Error description"
}

## Success Responses

Successful operations return:

{
  "status": "success",
  "message": "Operation description",
  "data": {
    // Response data
  }
}

## Development

### Running in Development Mode
npm run dev

### Running in Production Mode
npm start

### Database Reset
# Run the reset-db.sql script in your PostgreSQL database

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- SQL injection prevention with parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
