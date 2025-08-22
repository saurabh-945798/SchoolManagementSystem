import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

const AttendanceSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const student = JSON.parse(localStorage.getItem("studentData"));
  const studentId = student?._id;
  const token = localStorage.getItem("studentToken");

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const res = await axios.get(
          `/api/attendance/student/by-id/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSummary({
          total: res.data.totalDays,
          present: res.data.presentDays,
          percentage: res.data.percentage,
        });
      } catch (err) {
        console.error("Error fetching attendance summary:", err.message);
        setError("Failed to load attendance summary");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && token) fetchAttendanceSummary();
  }, [studentId, token]);

  if (loading) {
    return (
      <div className="text-center text-blue-500 mt-6 animate-pulse text-lg">
        Fetching your attendance stats...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-6">{error}</div>;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  const cards = [
    {
      title: "Total Days",
      icon: (
        <div className="p-3 rounded-xl bg-purple-100">
          <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
        </div>
      ),
      value: summary.total,
      glow: "shadow-purple-200",
    },
    {
      title: "Present Days",
      icon: (
        <div className="p-3 rounded-xl bg-green-100">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
      ),
      value: summary.present,
      glow: "shadow-green-200",
    },
    {
      title: "Attendance %",
      icon: (
        <div className="p-3 rounded-xl bg-blue-100">
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
        </div>
      ),
      value: `${summary.percentage}%`,
      glow: "shadow-blue-200",
    },
  ];

  return (
    <div className="mt-10 px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Attendance Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
            className={`rounded-2xl p-6 shadow-lg ${card.glow} backdrop-blur-md border border-white/20 bg-white/80 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              {card.icon}
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummary;
