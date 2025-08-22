import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Load Inter font dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post("/api/auth/admin/login", {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("adminToken", token);
      navigate("/admin-dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Unknown error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 font-inter">
      {/* Logo and School Name */}
      <div
        className="flex flex-col items-center mb-12 opacity-0 animate-fade-slide"
        style={{
          animationFillMode: "forwards",
          animationDuration: "1s",
          animationTimingFunction: "ease-out",
        }}
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5FSZKy-zhV2uaBCnvOnGRUpognoV8CumP6Q&s"
          alt="School Logo"
          className="w-24 h-24 mb-4"
          style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }}
        />
        <h1 className="text-4xl font-semibold text-gray-900 select-none tracking-wide">
        Sanskar Public School, Mathura 
        </h1>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 tracking-tight">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-7">
          {/* Email Input */}
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer placeholder-transparent w-full px-4 pt-7 pb-3 border border-gray-300 rounded-lg
                         text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 transition"
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2 text-gray-500 text-base font-semibold
                         peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                         peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600 transition-all cursor-text"
            >
              Email Address
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer placeholder-transparent w-full px-4 pt-7 pb-3 border border-gray-300 rounded-lg
                         text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 transition"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-gray-500 text-base font-semibold
                         peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                         peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600 transition-all cursor-text"
            >
              Password
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-red-600 text-center font-semibold">{errorMsg}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg
                       shadow-md transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       active:scale-95 transform"
          >
            Login
          </button>
        </form>

        {/* Tech Support Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For any technical issues, contact:{" "}
            <span className="font-semibold text-gray-800">+91 6397632425</span> or{" "}
            <a
              href="mailto:nextgencodex@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              nextgencodex@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-slide {
          0% {
            opacity: 0;
            transform: translateY(-15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-slide {
          animation-name: fade-slide;
          animation-fill-mode: forwards;
          animation-duration: 1s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
