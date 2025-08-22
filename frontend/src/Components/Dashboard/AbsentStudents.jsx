import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion"; // animation library

const backendURL = "http://localhost:5000"; // Backend URL

const AbsentStudents = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchAbsentStudents = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/attendance/absent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("❌ Absent students fetch nahi ho paye!");
      } finally {
        setLoading(false);
      }
    };

    fetchAbsentStudents();
  }, [token]);

  const toggleSelect = (studentId) => {
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === students.length) {
      setSelected([]);
    } else {
      setSelected(students.map((stu) => stu._id));
    }
  };

  const sendMessage = async () => {
    if (selected.length === 0) {
      toast.warn("⚠️ Koi student select toh karo!");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/api/attendance/send-message`,
        { studentIds: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "✅ Message bhej diye gaye!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Message bhejne me problem aa gayi!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-xl rounded-2xl"
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📋 Absent Students List
      </h1>

      {students.length === 0 ? (
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-green-600 text-lg font-semibold bg-green-50 p-4 rounded-lg shadow"
        >
          🎉 Aaj koi absent student nahi hai!
        </motion.p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <tr>
                  <th className="p-3 border">
                    <input
                      type="checkbox"
                      checked={selected.length === students.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="p-3 border">Roll No</th>
                  <th className="p-3 border">Student Name</th>
                  <th className="p-3 border">Class-Section</th>
                  <th className="p-3 border">Father's Name</th>
                  <th className="p-3 border">Father's Contact</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, index) => (
                  <motion.tr
                    key={stu._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-3 border text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(stu._id)}
                        onChange={() => toggleSelect(stu._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 border font-semibold text-gray-700">
                      {stu.rollNumber || "N/A"}
                    </td>
                    <td className="p-3 border">{stu.name || "N/A"}</td>
                    <td className="p-3 border">
                      {stu.class && stu.section
                        ? `${stu.class}-${stu.section}`
                        : "N/A"}
                    </td>
                    <td className="p-3 border">{stu.fatherName || "N/A"}</td>
                    <td className="p-3 border text-blue-600 font-medium">
                      {stu.fatherPhone || "N/A"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={sendMessage}
            className="mt-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            Send Message to Selected Parents
          </motion.button>
        </>
      )}
    </motion.div>
  );
};

export default AbsentStudents;
