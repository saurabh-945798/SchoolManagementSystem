import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";

const backendURL = "http://localhost:5000";

const AdminFeePayments = () => {
  const [studentsPayments, setStudentsPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "online" | "offline"

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${backendURL}/api/student-fees/admin/all-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentsPayments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on toggle
  const filteredPayments = studentsPayments
    .map((studentData) => {
      let payments = studentData.payments;
      if (filter !== "all") {
        payments = payments.filter((p) => p.paymentType === filter);
      }
      return { ...studentData, payments };
    })
    .filter((studentData) => studentData.payments.length > 0);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 p-5 rounded-2xl shadow-lg bg-white/70 backdrop-blur-md border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
            💸 Student Payments
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of all student transactions.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2">
          {["all", "online", "offline"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${
                filter === type
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
              }`}
            >
              {type === "all" ? "All" : type === "online" ? "Online" : "Offline"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ClipLoader size={40} color="#4F46E5" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="no-data"
            className="w-24 mx-auto mb-4 opacity-70"
          />
          <p className="text-gray-500 text-lg">No payments found for the selected filter.</p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-600 text-white sticky top-0">
              <tr>
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment Type</th>
                <th className="px-5 py-3">Payment ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((studentData) =>
                studentData.payments.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {studentData.student?.name || "N/A"}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {studentData.student?.rollNumber || "N/A"}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {studentData.student?.class || "N/A"}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {studentData.student?.section || "N/A"}
                    </td>
                    <td className="px-5 py-3 font-semibold flex items-center gap-1 text-green-600">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      {p.amountPaid}
                    </td>
                    <td className="px-5 py-3 text-gray-700 capitalize">{p.paymentType}</td>
                    <td className="px-5 py-3 text-gray-600">{p.razorpayPaymentId || "-"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status === "success" ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(p.paidAt).toLocaleDateString()}{" "}
                      <span className="block text-xs text-gray-400">
                        {new Date(p.paidAt).toLocaleTimeString()}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFeePayments;
