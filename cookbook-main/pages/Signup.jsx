import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from '../src/api';
import { SIGNUP_IMAGE } from '../src/assets/images';

export function SignupPage() {
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
      const response = await apiService.signup(data);
      const resData = response.data;

      if (resData.data && resData.data.token) {
        // Don't store token on signup, just show success message
        alert('Registration successful! Please login with your credentials.');
        reset();
        navigate('/login');
      }
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        //  Show each Zod error under the correct field
        errorData.errors.forEach((zodErr) => {
          setError(zodErr.path, {
            type: 'server',
            message: zodErr.message,
          });
        });
      } else {
        //  Generic backend error
        setError("email", {
          type: "server",
          message: errorData?.message || "Registration failed",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <img src={SIGNUP_IMAGE} alt="Signup" className="w-full h-40 object-cover rounded mb-4" />
        <h1 className="text-5xl text-gray-900 font-bold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">User Name</label>
            <input
              type="text"
              {...register("name", {
                required: "User name is required",
                minLength: { value: 2, message: "User name must be at least 2 characters" }
              })}
              placeholder="Enter your user name"
              className="w-full p-2 border rounded border-gray-950 text-black"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

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
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              className="w-full p-2 border rounded border-gray-950 text-black"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* OR separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Social Signup Icons (horizontal, icon-only) */}
        <div className="flex justify-center gap-8 mb-2">
          <span
            className="cursor-pointer transition-transform duration-200 hover:scale-110 hover:shadow-lg"
            title="Sign up with Google"
            aria-label="Sign up with Google"
            onClick={() => alert('Google signup coming soon!')}
          >
            {/* Official Google SVG */}
            <svg className="w-10 h-10" viewBox="0 0 48 48">
              <g>
                <path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5.1-.7.1-1.3.1-2 0-1.3-.1-2.6-.3-3.5z" fill="#FFC107"/>
                <path d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.7 0-14.2 4.3-17.7 10.7z" fill="#FF3D00"/>
                <path d="M24 45c5.7 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 36.2 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.7l-7 5.4C7.8 41.1 15.3 45 24 45z" fill="#4CAF50"/>
                <path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C17.5 42.3 20.6 45 24 45c6.6 0 12-5.4 12-12 0-.8-.1-1.5-.2-2.2z" fill="#1976D2"/>
              </g>
            </svg>
          </span>
          <span
            className="cursor-pointer transition-transform duration-200 hover:scale-110 hover:shadow-lg"
            title="Sign up with Facebook"
            aria-label="Sign up with Facebook"
            onClick={() => alert('Facebook signup coming soon!')}
          >
            {/* Official Facebook SVG */}
            <svg className="w-10 h-10" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill="#1877F3"/>
              <path d="M22.675 10.273h-2.197c-.172 0-.353.227-.353.545v1.636h2.55l-.333 2.545h-2.217V24h-3.273v-9h-1.636v-2.545h1.636v-1.636c0-2.09 1.09-3.182 3.273-3.182h2.182v2.545z" fill="#fff"/>
            </svg>
          </span>
        </div>

        <p className="mt-4 text-center text-blue-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
