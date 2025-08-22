import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

const backendURL = "http://localhost:5000";

const FeeSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("studentToken");
  const student = JSON.parse(localStorage.getItem("studentData"));

  const axiosInstance = axios.create({
    baseURL: backendURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchFeeSummary = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/offline-fees/summary/${student._id}`
      );

      const { onlinePayments = [], offlinePayments = [], totalFee = 0 } = res.data;

      // Calculate totals
      const onlinePaid = onlinePayments.reduce(
        (sum, p) => sum + (Number(p.amountPaid) || 0),
        0
      );
      const offlinePaid = offlinePayments.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );
      const totalPaid = onlinePaid + offlinePaid;
      const due = Math.max(totalFee - totalPaid, 0);

      // Status flags
      const hasPaidFull = totalPaid >= totalFee;
      const hasPaidHalf = totalPaid > 0 && totalPaid < totalFee;

      setSummary({
        totalFee,
        onlinePaid,
        offlinePaid,
        totalPaid,
        due,
        hasPaidFull,
        hasPaidHalf,
      });
    } catch (err) {
      console.error("Error fetching fee summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeSummary();
  }, []);

  const getStatus = () => {
    if (summary?.hasPaidFull) {
      return {
        label: "Fully Paid",
        icon: <CheckCircleIcon className="w-7 h-7 text-emerald-500" />,
        color: "bg-emerald-50 border-emerald-200",
      };
    } else if (summary?.hasPaidHalf) {
      return {
        label: "Partial Paid",
        icon: <ClockIcon className="w-7 h-7 text-amber-500" />,
        color: "bg-amber-50 border-amber-200",
      };
    } else {
      return {
        label: "Not Paid",
        icon: <ExclamationCircleIcon className="w-7 h-7 text-rose-500" />,
        color: "bg-rose-50 border-rose-200",
      };
    }
  };

  if (loading || !summary) {
    return (
      <div className="bg-white/50 p-5 rounded-2xl shadow-md flex justify-center items-center backdrop-blur-md border border-white/40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  const status = getStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-tr from-white/70 to-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-200/70 p-2 rounded-full border border-indigo-300">
          <CurrencyRupeeIcon className="w-6 h-6 text-indigo-700" />
        </div>
        <h3 className="text-lg font-extrabold text-indigo-800 tracking-tight">
          Fee Summary
        </h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          label="Total Fee"
          value={summary.totalFee}
          color="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
          valueColor="text-indigo-800"
        />
        <SummaryCard
          label="Paid"
          value={summary.totalPaid}
          color="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          valueColor="text-emerald-800"
        />
        <SummaryCard
          label="Due"
          value={summary.due}
          color="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          valueColor="text-amber-800"
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-xl border ${status.color} flex flex-col items-center justify-center`}
        >
          {status.icon}
          <p className="mt-1 text-sm font-semibold text-gray-700">
            {status.label}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Reusable Card Component
const SummaryCard = ({ label, value, color, valueColor }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-xl border ${color} flex flex-col items-center justify-center transition`}
    >
      <p className={`text-xl font-bold ${valueColor}`}>₹{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </motion.div>
  );
};

export default FeeSummary;
