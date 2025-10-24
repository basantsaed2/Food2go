import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setUser } from "../../Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { usePost } from "@/Hooks/UsePost";
import axios from "axios";
import { MdFastfood } from "react-icons/md";

const LoginAdmin = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/api/admin/auth/login`, type: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing admin session
  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("token");

    if (adminData && token) {
      const parsedUser = JSON.parse(adminData);
      if (parsedUser?.role === "admin" && parsedUser.token === token) {
        dispatch(setUser(parsedUser));
        navigate("/", { replace: true });
      } else {
        localStorage.removeItem("admin");
        localStorage.removeItem("token");
      }
    }
  }, [navigate, dispatch]);

  // Handle login response
  useEffect(() => {
    if (!loadingPost && response) {
      if (response.status === 200 && response.data) {
        console.log('response', response)
        dispatch(setUser(response?.data));
        localStorage.setItem("admin", JSON.stringify(response?.data?.admin));
        localStorage.setItem("token", response?.data?.admin.token);
        const redirectTo = new URLSearchParams(location.search).get("redirect");
        navigate(redirectTo || "/");
      } else {
        setErrors({ general: response.data.message || "Invalid Credentials" });
        toast.error(response.data.message || "Invalid Credentials");
      }
    }
  }, [response, loadingPost, dispatch, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const body = new FormData();
    body.append("email", email);
    body.append("password", password);
    postData(body);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-white/10"></div>
          <div className="absolute top-1/3 right-6 w-10 h-10 rounded-full bg-white/5"></div>
        </div>

        {/* Right side - Form */}
        <Card className="w-full md:w-3/5 bg-white/90 backdrop-blur-xl border border-bg-primary/50">
          <CardContent className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-bold text-bg-primary mb-2">Welcome Back</h1>
              <p className="text-bg-primary">Sign in to access the Admin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-bg-primary bg-white/70 transition-all duration-200`}
                    disabled={loadingPost}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-bg-primary focus:border-bg-primary bg-white/70 transition-all duration-200`}
                    disabled={loadingPost}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary hover:text-bg-secondary transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="p-3 bg-bg-third text-red-700 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-bg-primary to-bg-secondary text-white font-semibold py-4 text-lg rounded-lg hover:from-bg-primary/80 hover:to-bg-secondary/80 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={loadingPost}
              >
                {loadingPost ? (
                  <div className="flex items-center justify-center !py-6">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      <ToastContainer />
    </div>
  );
};

export default LoginAdmin;