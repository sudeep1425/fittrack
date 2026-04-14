import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "./api/axios";

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const savedCredsRaw = localStorage.getItem("saved_creds");
  const savedCreds = savedCredsRaw ? JSON.parse(savedCredsRaw) : null;
  const [rememberMe, setRememberMe] = useState(Boolean(savedCreds));

  const [name, setName] = useState("");
  const [email, setEmail] = useState(savedCreds?.email || "");
  const [password, setPassword] = useState("");

  // Restore signed-in user if found.
  useEffect(() => {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
        // 🔥 LOGIN
        const res = await api.post("/login", { email, password });

        const { token, user } = res.data;

        // ✅ STORE TOKEN (VERY IMPORTANT)
        localStorage.setItem("token", token);

        const userData = { ...user, token };

        // ✅ Store user
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("saved_creds", JSON.stringify({ email }));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          localStorage.removeItem("saved_creds");
        }

        setUser(userData);

        toast.success("Login successful 🎉");

        // ✅ Redirect
        window.location.href = "/dashboard";

      } else {
        // 🔥 REGISTER
        const res = await api.post("/register", {
          name,
          email,
          password,
        });

        const { token, user } = res.data;

        // ✅ STORE TOKEN
        localStorage.setItem("token", token);

        const userData = { ...user, token };

        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("saved_creds", JSON.stringify({ email }));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          localStorage.removeItem("saved_creds");
        }

        setUser(userData);

        toast.success("Account created 🎉");

        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.error || "Something went wrong ❌"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-96 border border-white/20">

        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 mb-4 rounded-xl bg-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded-xl bg-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 rounded-xl bg-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label className="ml-2 text-sm">Remember Me</label>
          </div>

          <button className="w-full bg-green-500 p-3 rounded-xl">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p
          className="text-center mt-4 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "New user? Sign up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Login;