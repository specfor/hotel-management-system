import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, Input, Card, LoadingSpinner } from "../components/primary";
import type { LoginCredentials } from "../types/auth";

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(credentials);
      // Navigation will happen automatically due to auth state change
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Welcome back to Grand Plaza Hotel Management System</p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange("email")}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange("password")}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !credentials.email || !credentials.password}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>

            {/* Demo Credentials */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-3">Demo Credentials (Password: password123):</p>
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="font-medium text-red-800 mb-1">Administrator (Full Access)</p>
                    <p className="text-red-600">admin@hotel.com</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">Manager (Most Features)</p>
                    <p className="text-blue-600">manager@hotel.com</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="font-medium text-green-800 mb-1">Staff (Basic Access)</p>
                    <p className="text-green-600">staff@hotel.com</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="font-medium text-yellow-800 mb-1">Receptionist (Limited Access)</p>
                    <p className="text-yellow-600">receptionist@hotel.com</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Grand Plaza Hotel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
