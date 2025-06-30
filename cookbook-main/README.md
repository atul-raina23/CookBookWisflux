# CookBook Full Stack Application

A complete recipe management application built with React, NestJS, and PostgreSQL.

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing
- Protected routes

### Recipe Management
- Create recipes with rich text instructions (Quill Editor)
- View all recipes
- View your own recipes
- Edit and delete your recipes
- Recipe search functionality

### Forkify Integration
- Search recipes from Forkify API
- Real-time suggestions while creating recipes
- Integration with external recipe database

### Favorites System
- Add recipes to favorites
- Remove recipes from favorites
- View your favorite recipes
- Toggle favorite status

### User Interface
- Modern, responsive design with Tailwind CSS
- Beautiful home page with search functionality
- Recipe cards with images
- Navigation between pages
- Loading states and error handling

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Quill Editor** - Rich text editor for instructions
- **Axios** - HTTP client

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-relational mapping
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Axios** - HTTP client for external APIs

### Database
- **PostgreSQL** - Relational database
- **pgAdmin 4** - Database management

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** installed and running
3. **pgAdmin 4** for database management

## Database Setup

1. Open pgAdmin 4
2. Create a new database named `cookbook_db`
3. Use these connection details:
   - Host: `localhost`
   - Port: `5433`
   - Username: `postgres`
   - Password: `Atulpostgres1234`
   - Database: `cookbook_db`

## Quick Start

### Option 1: Automated Startup (Windows)
1. Double-click `start-project.bat`
2. Wait for both servers to start
3. Open http://localhost:5173 in your browser

### Option 2: Manual Startup

#### Backend Setup
   ```bash
cd cook-backend
   npm install
npm run start:dev
```

#### Frontend Setup
   ```bash
cd cookbook-main
npm install
   npm run dev
   ```

## Testing

### Test All Features
1. Open http://localhost:5173/test-all-features.html
2. Click "Run Complete Test Suite"
3. Verify all tests pass

### Manual Testing
1. **Signup**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Recipe**: Add a new recipe with instructions
4. **Search**: Search for recipes (try "pizza", "cake", "chicken")
5. **Favorites**: Add/remove recipes from favorites
6. **My Recipes**: View and manage your recipes

## Project Structure

cookbook-main/
├── cook-backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/         # Authentication
│   │   ├── user/         # User management
│   │   ├── recipe/       # Recipe CRUD
│   │   ├── favorite/     # Favorites system
│   │   └── forkify/      # External API integration
│   └── env.local         # Environment variables
├── cookbook-main/         # React Frontend
│   ├── src/
│   │   ├── api.js        # API service
│   │   └── assets/       # Images and static files
│   ├── component/        # React components
│   ├── pages/           # Page components
│   └── layout/          # Layout components
└── README.md

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Recipes
- `GET /api/recipe` - Get all recipes
- `POST /api/recipe` - Create recipe
- `GET /api/recipe/:id` - Get recipe by ID
- `PUT /api/recipe/:id` - Update recipe
- `DELETE /api/recipe/:id` - Delete recipe
- `GET /api/recipe/user/my-recipes` - Get user's recipes
- `GET /api/recipe/search/:query` - Search recipes
- `GET /api/recipe/forkify/:query` - Search Forkify API

### Favorites
- `GET /api/favorite` - Get user's favorites
- `POST /api/favorite/:recipeId` - Add to favorites
- `DELETE /api/favorite/:recipeId` - Remove from favorites
- `GET /api/favorite/check/:recipeId` - Check favorite status

## Assignment Requirements Met

**User Interface in React and CSS**
- Home page with recipe search and display
- Login/register pages
- Recipe creation UI with Quill Editor
- Favorites page

**Backend with NestJS**
- PostgreSQL database integration
- Recipe CRUD operations
- Authentication system
- Favorites management
- Forkify API integration

**Features**
- User registration and login
- Recipe creation with rich text instructions
- Recipe search (local and Forkify)
- Favorites system
- Recipe management (view, edit, delete)
- Responsive design

**Technical Requirements**
- React & CSS frontend
- Axios for API integration
- NestJS backend
- PostgreSQL database
- Git version control

## Troubleshooting

### Backend Issues
1. Port 3001 in use: Kill existing processes or change port in `env.local`
2. Database connection: Verify PostgreSQL is running on port 5433
3. Missing dependencies: Run `npm install` in cook-backend directory

### Frontend Issues
1. Port 5173 in use: Vite will automatically use next available port
2. API connection: Ensure backend is running on http://localhost:3001
3. Missing dependencies: Run `npm install` in cookbook-main directory

### Database Issues
1. Connection failed: Check PostgreSQL service is running
2. Schema errors: Run the database reset scripts in cook-backend
3. Permission denied: Verify database credentials in `env.local`

## Notes

- The application uses a simple token-based authentication system
- Forkify API has rate limits (100 requests per hour)
- All recipe images are stored as URLs
- The database auto-syncs schema changes in development mode