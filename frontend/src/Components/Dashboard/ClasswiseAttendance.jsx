import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ClasswiseAttendance = () => {
  const [classes] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch attendance when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Admin not logged in!");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/classwise/${selectedClass}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.attendance) {
        setAttendanceData(res.data.attendance);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Classwise Attendance</h2>

      {/* Class Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <p>Loading attendance...</p>
      ) : attendanceData.length > 0 ? (
        <div className="overflow-x-auto">
          {attendanceData.map((record, index) => (
            <div key={index} className="mb-6 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Date: {new Date(record.date).toLocaleDateString()}
              </h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Student Name</th>
                    <th className="border p-2">Roll No</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {record.students.map((student, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{student.studentName}</td>
                      <td className="border p-2">{student.rollNumber}</td>
                      <td
                        className={`border p-2 font-semibold ${
                          student.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {student.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : selectedClass ? (
        <p>No attendance records found for this class.</p>
      ) : null}
    </div>
  );
};

export default ClasswiseAttendance;
