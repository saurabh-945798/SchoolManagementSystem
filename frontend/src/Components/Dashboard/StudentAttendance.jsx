import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [openMonths, setOpenMonths] = useState({});

  const student = JSON.parse(localStorage.getItem("studentData"));
  const studentId = student?._id;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await axios.get(`/api/attendance/student/by-id/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceData(res.data.attendance);
        setSummary({
          total: res.data.totalDays,
          present: res.data.presentDays,
          percentage: res.data.percentage,
        });
      } catch (err) {
        console.error("❌ Error fetching attendance:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchAttendance();
  }, [studentId]);

  const groupByMonth = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const month = new Date(item.date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(item);
    });
    return grouped;
  };

  const prepareChartData = (data) => {
    const monthly = {};
    data.forEach((item) => {
      const month = new Date(item.date).toLocaleString("default", { month: "short" });
      if (!monthly[month]) monthly[month] = { month, Present: 0, Absent: 0 };
      if (item.status === "Present") monthly[month].Present += 1;
      else monthly[month].Absent += 1;
    });
    return Object.values(monthly);
  };

  const toggleMonth = (month) => {
    setOpenMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  if (loading) {
    return <div className="text-center mt-16 text-xl text-gray-600 animate-pulse">⏳ Loading attendance...</div>;
  }

  const groupedAttendance = groupByMonth(attendanceData);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto font-poppins bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen">
      <motion.h1
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-12 text-center drop-shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        📅 Attendance Dashboard
      </motion.h1>

      {summary && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
        >
          {[
            { label: "Total Days", value: summary.total, color: "from-gray-100 to-gray-300", text: "text-gray-700" },
            { label: "Present Days", value: summary.present, color: "from-green-100 to-green-300", text: "text-green-800" },
            { label: "Attendance %", value: summary.percentage, color: "from-blue-100 to-blue-300", text: "text-blue-800", suffix: "%" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl p-6 shadow-lg bg-gradient-to-br ${item.color} backdrop-blur-lg border border-white/40 hover:scale-105 transition-transform`}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <p className="text-sm font-semibold text-gray-600">{item.label}</p>
              <h2 className={`text-3xl font-bold ${item.text}`}>
                <CountUp end={item.value} duration={1.5} suffix={item.suffix || ""} />
              </h2>
            </motion.div>
          ))}
        </motion.div>
      )}

      {attendanceData.length > 0 && (
        <motion.div
          className="bg-white/70 rounded-2xl shadow-xl p-6 mb-12 backdrop-blur-lg border border-white/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Monthly Attendance Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData(attendanceData)} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#34d399" radius={[10, 10, 0, 0]} />
              <Bar dataKey="Absent" fill="#f87171" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedAttendance).map((month, idx) => (
          <div key={idx} className="bg-white/80 rounded-xl shadow-lg p-4 backdrop-blur-lg border border-white/40">
            <button
              onClick={() => toggleMonth(month)}
              className="flex justify-between items-center w-full text-left font-semibold text-gray-800 text-lg"
            >
              {month}
              {openMonths[month] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>

            <AnimatePresence initial={false}>
              {openMonths[month] && (
                <motion.div
                  className="mt-4 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {groupedAttendance[month].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.02 }}
                      className={`flex justify-between items-center px-5 py-3 rounded-xl shadow-md border-l-[6px] ${
                        item.status === "Present"
                          ? "bg-green-50 border-green-400"
                          : "bg-red-50 border-red-400"
                      } hover:scale-[1.01] transition-transform`}
                    >
                      <div className="flex items-center gap-3 text-gray-700">
                        <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          item.status === "Present"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
