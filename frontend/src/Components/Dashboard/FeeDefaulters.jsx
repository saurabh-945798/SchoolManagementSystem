import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

const FeeDefaulters = () => {
  const [defaulters, setDefaulters] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/student-fees/admin/class-wise-defaulters",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setDefaulters(res.data.defaulters);
      } catch (err) {
        console.error("❌ Failed to load defaulters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaulters();
  }, []);

  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const handleDownload = () => {
    const rows = [];
    Object.entries(defaulters).forEach(([className, students]) => {
      students.forEach((student) => {
        rows.push({
          Class: className,
          Name: student.name,
          Section: student.section || "N/A",
          FatherName: student.fatherName || "N/A",
          FatherContact: student.fatherContact || "N/A",
          Paid: student.totalPaid,
          Total: student.totalFee,
          Due: student.due,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Defaulters");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "FeeDefaulters.xlsx");
  };

  return (
    <div className="p-6 relative max-w-6xl mx-auto">
      {/* Glow background */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-400 opacity-20 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-3xl font-extrabold text-blue-800">
          📚 Fee Defaulters (Class-wise)
        </h2>
        {Object.keys(defaulters).length > 0 && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download Excel
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-500 animate-pulse relative z-10">
          ⏳ Loading student data...
        </div>
      ) : Object.keys(defaulters).length === 0 ? (
        <div className="text-green-700 bg-green-50 p-5 rounded-xl shadow relative z-10">
          🎉 All students have paid their fees on time!
        </div>
      ) : (
        Object.entries(defaulters).map(([className, students], idx) => (
          <motion.div
            key={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="mb-6 rounded-2xl shadow-lg overflow-hidden bg-white/80 backdrop-blur-lg border border-white/40 relative z-10"
          >
            {/* Class Header */}
            <button
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
              onClick={() => toggleExpand(className)}
            >
              <span className="font-semibold text-lg text-blue-900">
                {className} —{" "}
                <span className="text-sm text-gray-600">
                  {students.length} student(s)
                </span>
              </span>
              {expandedClasses[className] ? (
                <ChevronUpIcon className="w-5 h-5 text-blue-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            {/* Expandable List */}
            <AnimatePresence>
              {expandedClasses[className] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="divide-y px-4 py-2"
                >
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      {/* Student Info */}
                      <div>
                        <p className="text-gray-900 font-semibold flex items-center gap-1">
                          <UserIcon className="w-5 h-5 text-blue-500" />
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Section: {student.section || "N/A"}
                        </p>
                      </div>

                      {/* Parent Info */}
                      <div>
                        <p className="text-sm text-gray-700">
                          Father: {student.fatherName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          {student.fatherContact || "N/A"}
                        </p>
                      </div>

                      {/* Fee Info */}
                      <div className="text-right">
                        <p className="text-red-600 font-semibold flex items-center justify-end gap-1">
                          <CurrencyRupeeIcon className="w-4 h-4" />
                          Due: ₹{student.due}
                        </p>
                        <p className="text-xs text-gray-600">
                          Paid: ₹{student.totalPaid} / ₹{student.totalFee}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default FeeDefaulters;
