import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ManageFees = () => {
  const [className, setClassName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className || !amount) return toast.error("⚠️ Please fill all fields");

    try {
      const token = localStorage.getItem("adminToken");

      await axios.post("http://localhost:5000/api/fees", { className, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("✅ Fee created successfully!");
      setClassName("");
      setAmount("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create fee");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-purple-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          ➕ Add Class Fee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Class Select */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Class</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Class --</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={`Class ${i + 1}`}>
                  Class {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md"
          >
            ➕ Add Fee
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageFees;
