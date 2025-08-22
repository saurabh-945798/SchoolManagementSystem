import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  TagIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/complaints/admin/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      setError("Failed to load complaints.");
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `/api/complaints/admin/complaints/${id}/status`,
        {
          status,
          adminRemarks: remarks[id] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComplaints();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Failed to update complaint status");
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      setDeletingId(id);
      await axios.delete(`/api/complaints/admin/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("❌ Error deleting complaint:", err);
      alert("Failed to delete complaint");
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-6">
      <motion.h1
        className="text-4xl font-extrabold text-center text-indigo-800 mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🗂️ Admin Complaints Dashboard
      </motion.h1>

      {loading ? (
        <motion.p
          className="text-center text-gray-600 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading complaints...
        </motion.p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : complaints.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No complaints found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {complaints.map((complaint, index) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-xl rounded-xl p-6 border border-indigo-200 hover:shadow-2xl hover:border-indigo-400 transition-all"
            >
              {/* Student Info */}
              <div className="flex items-center mb-4">
                <UserCircleIcon className="h-8 w-8 text-indigo-500 mr-3" />
                <div>
                  <p className="font-bold text-lg text-gray-800">
                    {complaint.studentName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Roll No: {complaint.rollNo} | Class: {complaint.className}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="font-semibold text-gray-700">Title</p>
                </div>
                <p className="text-gray-800">{complaint.title}</p>
              </div>

              {/* Description */}
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <p className="font-semibold text-gray-700">Description</p>
                </div>
                <p className="text-gray-700">{complaint.description}</p>
              </div>

              {/* Category & Status */}
              <div className="flex justify-between items-center mt-4 mb-3">
                <span className="flex items-center text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                  <TagIcon className="h-4 w-4 mr-1" />
                  {complaint.category}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-semibold ${
                    complaint.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : complaint.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>

              {/* Admin Remarks */}
              {complaint.status === "pending" && (
                <textarea
                  placeholder="Add admin remarks..."
                  className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={remarks[complaint._id] || ""}
                  onChange={(e) =>
                    setRemarks({ ...remarks, [complaint._id]: e.target.value })
                  }
                />
              )}

              {/* Buttons */}
              <div className="flex gap-2 mt-2">
                {complaint.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(complaint._id, "approved")}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition"
                    >
                      <CheckCircleIcon className="h-5 w-5" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(complaint._id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition"
                    >
                      <XCircleIcon className="h-5 w-5" /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteComplaint(complaint._id)}
                  disabled={deletingId === complaint._id}
                  className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded-lg text-sm transition"
                >
                  <TrashIcon className="h-5 w-5" />
                  {deletingId === complaint._id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {/* Already Processed Remark */}
              {complaint.status !== "pending" && complaint.adminRemarks && (
                <p className="mt-3 text-xs text-gray-500 border-t pt-2">
                  Remarks: {complaint.adminRemarks}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
