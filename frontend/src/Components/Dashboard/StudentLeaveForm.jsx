import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  DocumentArrowUpIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const StudentLeaveForm = () => {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const leavesPerPage = 5;

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await axios.get("/api/leaves/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pending = res.data.find((leave) => leave.status === "pending");
        setPendingLeave(!!pending);
        setLeaveHistory(res.data.reverse());
      } catch (err) {
        console.error("Fetch leaves error", err);
      }
    };
    fetchLeaves();
  }, []);

  const handleFileUpload = async () => {
    if (!certificateFile) return null;
    const formData = new FormData();
    formData.append("certificate", certificateFile);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await axios.post("/api/leaves/upload-certificate", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.url;
    } catch (err) {
      toast.error("Certificate upload failed.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !fromDate || !toDate || !reason) {
      return toast.warning("Please fill all required fields.");
    }

    setLoading(true);
    try {
      let uploadedUrl = null;
      if (leaveType === "medical" && certificateFile) {
        uploadedUrl = await handleFileUpload();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem("studentToken");
      await axios.post(
        "/api/leaves/apply",
        {
          leaveType,
          fromDate,
          toDate,
          reason,
          certificateUrl: uploadedUrl || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Leave applied successfully!");
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setCertificateFile(null);
      setCurrentPage(1);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply for leave");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastLeave = currentPage * leavesPerPage;
  const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;
  const currentLeaves = leaveHistory.slice(indexOfFirstLeave, indexOfLastLeave);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 p-4 md:p-8">
      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 md:p-8 max-w-3xl mx-auto"
      >
        <div className="mb-6 flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Apply for Leave</h2>
        </div>

        {pendingLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-xl flex items-center gap-2 mb-4 shadow-sm"
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            You already have a pending leave request.
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              className="w-full border rounded-xl p-3 shadow-sm focus:ring focus:ring-indigo-300"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="medical">Medical</option>
              <option value="event">Event</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                className="w-full border rounded-xl p-3 shadow-sm focus:ring focus:ring-indigo-300"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                className="w-full border rounded-xl p-3 shadow-sm focus:ring focus:ring-indigo-300"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              className="w-full border rounded-xl p-3 shadow-sm focus:ring focus:ring-indigo-300"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for leave..."
              required
            />
          </div>

          {leaveType === "medical" && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <DocumentArrowUpIcon className="w-5 h-5 text-gray-500" />
                Upload Medical Certificate (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                className="w-full border rounded-lg p-2"
                onChange={(e) => setCertificateFile(e.target.files[0])}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pendingLeave}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 px-4 rounded-xl font-bold w-full shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </motion.div>

      {/* Leave History */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 md:p-8 max-w-5xl mx-auto mt-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <ClockIcon className="w-7 h-7 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Leave History</h2>
        </div>

        {leaveHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-5">
            No leave history found.
          </p>
        ) : (
          <>
            {/* Responsive Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaves.map((leave, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-b last:border-none hover:bg-indigo-50 transition"
                    >
                      <td className="px-4 py-3 font-medium capitalize">
                        {leave.leaveType}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(leave.fromDate).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(leave.toDate).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">{leave.reason}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            leave.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : leave.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentLeaves.map((leave, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 shadow-sm bg-white space-y-1"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold capitalize">{leave.leaveType}</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        leave.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>From:</strong> {new Date(leave.fromDate).toISOString().slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>To:</strong> {new Date(leave.toDate).toISOString().slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {Math.ceil(leaveHistory.length / leavesPerPage)}
              </span>
              <button
                disabled={indexOfLastLeave >= leaveHistory.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default StudentLeaveForm;
