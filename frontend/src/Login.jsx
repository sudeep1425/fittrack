import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API_URL from "./api";

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Auto login or pre-fill credentials
  useEffect(() => {
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedCreds = localStorage.getItem("saved_creds");
    if (savedCreds) {
      const { email: savedEmail } = JSON.parse(savedCreds);
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, user } = response.data;
        
        const userData = { ...user, token };

        if (isAdminLogin && user.role !== 'admin') {
          toast.error("You are not authorized as an Admin");
          return;
        }

        // ✅ Save to localStorage if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("saved_creds", JSON.stringify({ email }));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          localStorage.removeItem("saved_creds");
        }

        setUser(userData);
        toast.success("Welcome back!");
      } else {
        const response = await axios.post(`${API_URL}/register`, { name, email, password });
        const { token, user } = response.data;

        const userData = { ...user, token };
        
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("saved_creds", JSON.stringify({ email }));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          localStorage.removeItem("saved_creds");
        }

        setUser(userData);
        toast.success("Account created successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">

      <div className={`bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-96 border ${isAdminLogin ? "border-purple-400" : "border-white/20"} transition-all duration-500`}>

        <h2 className="text-3xl font-bold mb-2 text-center">
          {isLogin ? (isAdminLogin ? "Admin Login" : "Login") : "Sign Up"}
        </h2>
        <p className="text-center text-xs opacity-60 mb-8 uppercase tracking-widest">
          {isAdminLogin ? "Security Clearance Required" : "Welcome to Health Hub"}
        </p>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              placeholder="Full Name"
              className="w-full p-3 mb-4 rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {/* ✅ Email */}
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Field */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Password"
              className="w-full p-3 pr-12 rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 cursor-pointer text-gray-200 hover:text-white transition"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* ✅ Remember Me */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-2 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="text-sm cursor-pointer select-none">Remember Me</label>
          </div>

          <button
            type="submit"
            className={`w-full ${isAdminLogin ? "bg-gradient-to-r from-purple-500 to-indigo-600" : "bg-gradient-to-r from-green-400 to-emerald-600"} p-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition shadow-lg`}
          >
            {isLogin ? (isAdminLogin ? "Access Admin Panel" : "Login") : "Create Account"}
          </button>

        </form>

        <div className="mt-8 flex flex-col gap-3">
          <p
            className="text-center text-sm cursor-pointer hover:underline opacity-80 hover:opacity-100 transition"
            onClick={() => {
              setIsLogin(!isLogin);
              setIsAdminLogin(false);
            }}
          >
            {isLogin
              ? "New user? Create account"
              : "Already have an account? Login"}
          </p>

          <p
            className={`text-center text-[10px] uppercase font-black tracking-widest cursor-pointer transition-all ${isAdminLogin ? "text-green-400" : "text-purple-400"}`}
            onClick={() => {
              setIsAdminLogin(!isAdminLogin);
              setIsLogin(true);
            }}
          >
            {isAdminLogin ? "Back to User Login" : "Switch to Admin Access"}
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
