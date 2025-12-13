// src/pages/auth/LoginBranch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "@/Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import { usePost } from "@/hooks/usePost";

const LoginBranch = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost } = usePost({
    url: `${apiUrl}/api/admin/auth/login`,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if branch is already logged in
  useEffect(() => {
    const branch = localStorage.getItem("branch");
    const token = localStorage.getItem("token");
    if (branch && token) {
      try {
        const user = JSON.parse(branch);
        // Ensure user is 'branch' before redirecting
        if (user.role === "branch" && user.token === token) {
          dispatch(setUser(user));
          navigate("/", { replace: true });
        } else {
          // If a non-branch user is somehow logged in, clear their session for safety
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      }
    }
  }, [dispatch, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});

    if (!email || !password) {
      setErrors({ email: !email && "Email is required", password: !password && "Password is required" });
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // 1. REMOVE 'successMessage' from the postData options
    postData(formData, {
      // successMessage: "Login successful!", <--- REMOVED THIS LINE
      onSuccess: (data) => {
        const branch = data?.admin;

        // 🚨 CRITICAL CHECK: Enforce login only for 'branch' role
        if (branch?.role !== "branch") {
          const roleError = "Access Denied: Only Branch accounts can log in here.";
          setErrors({ general: roleError });

          // 2. SHOW ERROR TOAST IF ROLE IS WRONG
          toast.error(roleError);
          return; // Stop the login process
        }

        // Proceed only if role is 'branch' and token exists
        if (branch?.token) {
          // 3. SHOW SUCCESS TOAST ONLY IF ROLE IS CORRECT
          toast.success("Login successful!");

          dispatch(setUser(branch));
          localStorage.setItem("branch", JSON.stringify(branch));
          localStorage.setItem("token", branch.token);

          const redirect = new URLSearchParams(location.search).get("redirect");
          navigate(redirect || "/", { replace: true });
        } else {
          // Fallback error if role is right but token is missing
          setErrors({ general: "Login failed: Authentication token is missing." });
          toast.error("An unexpected error occurred during login.");
        }
      },
      onError: (error) => {
        // Generic error handling for API failures (405, 401, etc.)
        const errorMessage = error?.message || "Login failed. Please check your credentials and try again.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      },
    });
  };

  // ... (rest of the component)

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-primary to-white p-4">
      <div className="relative max-w-6xl w-full flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Left side - Illustration */}
        <div className="hidden md:flex md:w-2/5 bg-bg-primary flex-col justify-center items-center p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/20 to-bg-secondary/30"></div>
          <div className="relative z-10 text-center">
            <div className="mb-6 flex justify-center">
              <MdFastfood className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Food2go</h2>
            <p className="text-white">Delicious meals delivered to your door</p>
          </div>
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-white/10"></div>
          <div className="absolute top-1/3 right-6 w-10 h-10 rounded-full bg-white/5"></div>
        </div>

        {/* Right side - Form */}
        <Card className="w-full md:w-3/5 bg-white/90 backdrop-blur-xl border border-bg-primary/50">
          <CardContent className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-bold text-bg-primary mb-2">Welcome Back</h1>
              <p className="text-bg-primary">Sign in to access the branch</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 pr-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-bg-primary bg-white/70 transition-all duration-200`}
                    disabled={loadingPost}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-12 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-bg-primary bg-white/70 transition-all duration-200`}
                    disabled={loadingPost}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary hover:text-bg-secondary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* General Error (for API/Role issues) */}
              {errors.general && (
                <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-bg-primary to-bg-secondary text-white font-semibold py-4 text-lg rounded-lg hover:from-bg-primary/80 hover:to-bg-secondary/80 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={loadingPost}
              >
                {loadingPost ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default LoginBranch;