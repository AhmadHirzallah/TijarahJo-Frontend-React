import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, Ban } from "lucide-react";
import { useNavigate } from "react-router";

type ErrorType = 'invalid_credentials' | 'account_disabled' | 'account_banned' | 'validation_error' | 'server_error';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType(null);
    setLoading(true);
    
    try {
      await login(formData);
      window.location.href = "#/";
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      
      console.error('Login error:', { status, data });
      
      // Handle banned account (403)
      if (status === 403) {
        setErrorType('account_banned');
        setError(data?.detail || 'Your account has been banned. Please contact support.');
        // Redirect to banned page after 2 seconds
        setTimeout(() => navigate('/account-banned'), 2000);
        return;
      }
      
      // Handle account disabled (401 with specific title)
      if (status === 401 && data?.title === 'Account disabled') {
        setErrorType('account_disabled');
        setError(data?.detail || 'This account has been deactivated. Please contact support.');
        return;
      }
      
      // Handle invalid credentials (401)
      if (status === 401) {
        setErrorType('invalid_credentials');
        setError(data?.detail || 'Invalid username or password.');
        return;
      }
      
      // Handle validation errors (400)
      if (status === 400) {
        setErrorType('validation_error');
        setError(data?.detail || data?.title || 'Please check your input.');
        return;
      }
      
      // Server error or unknown
      setErrorType('server_error');
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            <LogIn size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to access your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
              errorType === 'account_banned' ? 'bg-red-50 border border-red-500 text-red-800' :
              errorType === 'account_disabled' ? 'bg-yellow-50 border border-yellow-400 text-yellow-700' :
              errorType === 'invalid_credentials' ? 'bg-red-50 border border-red-200 text-red-700' :
              errorType === 'validation_error' ? 'bg-orange-50 border border-orange-400 text-orange-700' :
              'bg-gray-50 border border-gray-400 text-gray-700'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {errorType === 'account_banned' ? <Ban size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="flex-1">
                <p>{error}</p>
                {errorType === 'account_banned' && (
                  <p className="mt-1 text-xs">Redirecting to information page...</p>
                )}
                {errorType === 'account_disabled' && (
                  <p className="mt-2">
                    <a href="mailto:support@tijarahjo.com" className="font-bold underline">
                      Contact Support
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Username or Email
              </label>
              <div className="mt-1 relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  required
                  value={formData.login}
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="johndoe@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label className="ml-2 text-gray-600">Remember me</label>
            </div>
            <a href="#" className="font-bold text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="#/register"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Join now
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
