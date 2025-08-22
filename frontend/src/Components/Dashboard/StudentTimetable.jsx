import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const subjectColors = {
  Math: "bg-yellow-100 text-yellow-800",
  Physics: "bg-blue-100 text-blue-800",
  Chemistry: "bg-green-100 text-green-800",
  English: "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800",
};

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) {
          setError("Please log in to view your timetable.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/timetable/student", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimetable(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <motion.p
        className="text-center text-red-500 mt-6 text-lg font-semibold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error}
      </motion.p>
    );

  if (!timetable)
    return (
      <motion.p
        className="text-center text-gray-500 mt-6 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No timetable found.
      </motion.p>
    );

  // Extract all unique time slots for rows
  const allTimes = [
    ...new Set(
      timetable.days.flatMap((day) =>
        day.periods.map((p) => `${p.startTime} - ${p.endTime}`)
      )
    ),
  ];

  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <motion.div
      className="max-w-7xl mx-auto p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h2
        className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        📅 Timetable - Class {timetable.class} {timetable.section}
      </motion.h2>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `150px repeat(${daysOrder.length}, 1fr)` }}>
          {/* Header Row */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold p-3 sticky left-0 z-10">
            Time
          </div>
          {daysOrder.map((day) => (
            <div key={day} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold p-3 text-center">
              {day}
            </div>
          ))}

          {/* Rows */}
          {allTimes.map((time, rowIdx) => (
            <React.Fragment key={time}>
              {/* Time Column */}
              <div className="bg-white sticky left-0 border p-3 font-medium">{time}</div>

              {/* Day Columns */}
              {daysOrder.map((day) => {
                const dayData = timetable.days.find((d) => d.day === day);
                const period = dayData?.periods.find(
                  (p) => `${p.startTime} - ${p.endTime}` === time
                );

                return (
                  <motion.div
                    key={`${day}-${time}`}
                    className="border flex items-center justify-center p-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                  >
                    {period ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          subjectColors[period.subject] || subjectColors.default
                        }`}
                      >
                        {period.subject}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentTimetable;
