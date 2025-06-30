// src/App.jsx or wherever you define routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PrivateRoute from '../component/PrivateRoute';
import ErrorBoundary from '../component/ErrorBoundary';

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Login').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('../pages/Signup').then(module => ({ default: module.SignupPage })));
const AllRecipes = lazy(() => import('../component/AllRecipes').then(module => ({ default: module.AllRecipes })));
const MyRecipes = lazy(() => import('../component/MyRecipes'));
const MainLayout = lazy(() => import('../layout/MainLayout').then(module => ({ default: module.MainLayout })));
const Favourite = lazy(() => import('../component/Favourite'));
const CreateRecipe = lazy(() => import('../component/CreateRecipe'));
const RecipeDetail = lazy(() => import('../component/RecipeDetail'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/my-recipes" element={<MyRecipes />} />
              <Route path="/all-recipes" element={<AllRecipes />} />
              <Route path="/fav" element={<Favourite />} />
              <Route path="/add" element={<CreateRecipe/>} />
              <Route path="/create-recipe" element={<CreateRecipe/>} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
