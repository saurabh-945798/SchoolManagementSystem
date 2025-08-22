import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Load Inter font dynamically for consistency
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post("/api/auth/student/login", { email, dob });
      const { token, student } = res.data;

      localStorage.setItem("studentToken", token);
      localStorage.setItem("studentData", JSON.stringify(student));
      navigate("/student-dashboard");
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );
      setErrorMsg(err.response?.data?.message || "Unknown error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4 font-inter">
      
      {/* Logo and School Name */}
      <div
        className="flex flex-col items-center mb-10 opacity-0 animate-fade-slide"
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
        <h1 className="text-4xl font-semibold text-indigo-700 select-none tracking-wide">
        Sanskar Public School, Mathura 
        </h1>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10">
        <h2 className="text-3xl font-semibold mb-8 text-center text-indigo-700 tracking-tight">
          Student Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Student Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-base font-medium
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-base font-medium
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />

          {errorMsg && (
            <p className="text-red-600 text-center font-semibold">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg
                       shadow-md transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       active:scale-95 transform"
          >
            Login
          </button>
        </form>
      </div>

      {/* Footer with contact info */}
      <footer className="mt-8 text-center text-gray-600 text-sm select-none">
        <p>
          For assistance, contact us at{" "}
          <a
            href="tel:+91 6397632425"
            className="text-indigo-600 hover:underline"
            aria-label="Call school"
          >
            +91 6397632425
          </a>{" "}
          or email{" "}
          <a
            href="mailto:  nextgencodex@gmail.com"
            className="text-indigo-600 hover:underline"
            aria-label="Email school support"
          >
            nextgencodex@gmail.com
          </a>
        </p>
      </footer>

      {/* Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
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

export default StudentLogin;
