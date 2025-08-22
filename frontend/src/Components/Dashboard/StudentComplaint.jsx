import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChatBubbleLeftRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const StudentComplaint = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("studentToken");

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/complaints/student/my-complaints",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      toast.error("Failed to load your complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("You're not authenticated. Please log in again.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/complaints/student/complaint",
        {
          title,
          description: message,
          category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Complaint submitted successfully!");
      setTitle("");
      setMessage("");
      setCategory("");
      fetchComplaints();
    } catch (error) {
      console.error("Complaint error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to submit complaint."
      );
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?"))
      return;
    try {
      await axios.delete(
        `http://localhost:5000/api/complaints/student/complaints/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Complaint deleted successfully!");
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete complaint.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Complaint Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/30 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl mt-10"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700">
          <ChatBubbleLeftRightIcon className="w-7 h-7" />
          Submit a Complaint
        </h2>
        <form onSubmit={handleComplaintSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Complaint Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
            required
          >
            <option value="">Select Category</option>
            <option value="academic">Academic</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="behavior">Behavior</option>
            <option value="other">Other</option>
          </select>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your complaint"
            className="w-full px-4 py-3 h-32 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 resize-none"
            required
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            Submit Complaint
          </motion.button>
        </form>
      </motion.div>

      {/* Complaint List */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">My Complaints</h3>
        {loading ? (
          <p className="text-gray-600">Loading your complaints...</p>
        ) : complaints.length === 0 ? (
          <p className="text-gray-500">No complaints submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 border border-indigo-200 rounded-xl p-4 shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{c.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{c.description}</p>
                    {c.adminRemarks && (
                      <p className="text-sm text-gray-700 italic">
                        Admin Remark: {c.adminRemarks}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteComplaint(c._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                    title="Delete Complaint"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      c.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : c.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentComplaint;
