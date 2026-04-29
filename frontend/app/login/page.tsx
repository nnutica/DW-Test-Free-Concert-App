"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, ArrowRight, Home, Calendar, UserCircle, ChevronLeft, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

type ViewState = "select-role" | "login" | "register";
type Role = "USER" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("select-role");
  const [role, setRole] = useState<Role>("USER");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setView("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token } = res.data;

      // เซฟลง LocalStorage
      localStorage.setItem("token", access_token);

      // แกะ Token ดูว่า Role อะไร
      const decoded: any = jwtDecode(access_token);
      
      // Redirect ตาม Role
      if (decoded.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, fullName, role });
      // สมัครเสร็จกลับไปหน้า Login
      setView("login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // 1. หน้าเลือก Role (Select Access Level)
  // -----------------------------------------
  if (view === "select-role") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#006699] text-white p-4 flex items-center justify-center relative">
          <ChevronLeft className="absolute left-4 w-6 h-6" />
          <h1 className="text-lg font-semibold">Select Access Level</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8 hidden md:block">
              <h2 className="text-2xl font-bold text-gray-900">Select Access Level</h2>
              <p className="text-gray-500 mt-2 text-sm">Choose your role to continue booking free concert tickets.</p>
            </div>
            
            <div className="md:hidden text-center mb-6">
              <p className="text-gray-700 text-sm">Choose your role to continue booking free<br/>concert tickets.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* User Card */}
              <div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:border-[#006699] transition-all"
                onClick={() => handleRoleSelect("USER")}
              >
                <div className="w-12 h-12 bg-blue-50 text-[#006699] rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#006699] mb-2">User</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">
                  Book concert tickets and manage your bookings. Access your personal workspace.
                </p>
                <button className="w-full bg-[#006699] text-white py-2.5 rounded-md font-medium text-sm flex items-center justify-center">
                  Enter Workspace
                </button>
              </div>

              {/* Admin Card */}
              <div 
                className="bg-[#006699] rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:bg-[#005580] transition-all text-white"
                onClick={() => handleRoleSelect("ADMIN")}
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Administrator</h3>
                <p className="text-white/80 text-sm mb-6 flex-1">
                  Manage concerts, seating, and bookings. Access the administrator portal.
                </p>
                <button className="w-full bg-white text-[#006699] py-2.5 rounded-md font-medium text-sm flex items-center justify-center">
                  Enter Portal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t border-gray-200 flex justify-around p-3 pb-safe">
          <div className="flex flex-col items-center text-[#006699]">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1">Bookings</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <UserCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // 2. หน้า Login / Register
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Panel (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-[#006699] text-white p-12 flex-col justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#006699] font-bold">
            <span className="text-xs">DW</span>
          </div>
          <span className="text-xl font-semibold tracking-wider">BRAND</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            "Powering the tools that<br/>power the team."
          </h2>
          <p className="text-white/70 text-sm max-w-md">
            Lorem ipsum dolor sit amet consectetur. Est purus nam gravida porttitor nibh urna at senectus.
          </p>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-white relative">
        <button 
          onClick={() => setView("select-role")}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center text-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {view === "login" ? "Login" : "Sign Up"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699] focus:border-[#006699]"
                    placeholder="Enter your Email Address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Settings className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699] focus:border-[#006699]"
                    placeholder="Enter your Password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#006699] text-white py-2.5 rounded-md font-medium text-sm mt-6 hover:bg-[#005580] transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : `Login as ${role === 'ADMIN' ? 'Administrator' : 'User'}`}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-gray-500">Don't have an account? </span>
                <button type="button" onClick={() => setView("register")} className="text-xs text-[#006699] font-medium hover:underline">
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Register Form */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699]"
                    placeholder="Enter your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699]"
                    placeholder="Enter your Email Address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699]"
                    placeholder="Create a Password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#006699]"
                    placeholder="Re-enter your Password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#006699] text-white py-2.5 rounded-md font-medium text-sm mt-6 hover:bg-[#005580] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create an account"}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-gray-500">Already have an account? </span>
                <button type="button" onClick={() => setView("login")} className="text-xs text-[#006699] font-medium hover:underline">
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
