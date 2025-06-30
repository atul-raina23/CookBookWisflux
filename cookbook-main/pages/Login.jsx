import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from '../src/api';
import { LOGIN_IMAGE } from '../src/assets/images';

export function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const response = await apiService.login(data);
      
      const resData = response.data;

      if (resData.data && resData.data.token) {
        localStorage.setItem('token', resData.data.token);
        
        // Clear session storage to show welcome animation after login
        sessionStorage.removeItem('hasSeenWelcome');
        
        reset();
        
        // Simple navigation - just use navigate
        navigate('/', { replace: true });
        
      } else {
        setError("email", {
          type: "server",
          message: "Login failed - no token received",
        });
      }
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        // Handle Zod field errors
        errorData.errors.forEach((zodErr) => {
          setError(zodErr.path, {
            type: 'server',
            message: zodErr.message,
          });
        });
      } else {
        // Fallback error (e.g. invalid credentials)
        setError("email", {
          type: "server",
          message: errorData?.message || "Login failed",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <img src={LOGIN_IMAGE} alt="Login" className="w-full h-40 object-cover rounded mb-4" />
        <h1 className="text-5xl text-gray-900 font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full p-2 border rounded border-gray-950 text-black"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full p-2 border rounded border-gray-950 text-black"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-blue-500 hover:underline text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
