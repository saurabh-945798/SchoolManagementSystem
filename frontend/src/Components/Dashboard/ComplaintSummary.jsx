import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const ComplaintSummary = () => {
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("studentToken");

  const fetchSummary = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/complaints/student/my-complaints",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const complaints = res.data;
      setSummary({
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "pending").length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        rejected: complaints.filter((c) => c.status === "rejected").length,
      });
    } catch (err) {
      console.error("Error fetching complaint summary:", err);
      toast.error("Failed to load complaint summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.05, boxShadow: "0px 6px 15px rgba(0,0,0,0.15)" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-lg border border-white/30 p-5 rounded-2xl shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-indigo-100 p-2 rounded-full">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-700" />
        </div>
        <h3 className="text-lg font-bold text-indigo-700">Complaint Summary</h3>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total", value: summary.total, bg: "bg-indigo-100", text: "text-indigo-700" },
            { label: "Pending", value: summary.pending, bg: "bg-yellow-100", text: "text-yellow-700" },
            { label: "Resolved", value: summary.resolved, bg: "bg-green-100", text: "text-green-700" },
            { label: "Rejected", value: summary.rejected, bg: "bg-red-100", text: "text-red-700" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`${stat.bg} p-4 rounded-xl text-center cursor-pointer transition-all`}
            >
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`text-2xl font-bold ${stat.text}`}
              >
                {stat.value}
              </motion.p>
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ComplaintSummary;
