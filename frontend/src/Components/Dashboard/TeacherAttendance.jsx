import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

const TeacherAttendance = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const token = localStorage.getItem("teacherToken");

  // ✅ Fetch assigned classes
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher-portal/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data.assignedClasses)) {
          setAssignedClasses(res.data.assignedClasses);
        } else {
          toast.error("⚠️ Unexpected response format for assigned classes.");
        }
      } catch (err) {
        console.error("❌ Error fetching classes:", err);
        toast.error("Failed to load assigned classes");
      }
    };

    fetchAssignedClasses();
  }, [token]);

  // ✅ Fetch students when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/students/by-class/${selectedClass}`
        );
        setStudents(res.data);

        const defaultAttendance = {};
        res.data.forEach((stu) => {
          defaultAttendance[stu._id] = "Present";
        });
        setAttendance(defaultAttendance);
      } catch (err) {
        console.error("❌ Error fetching students:", err.message);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // ✅ Handle individual status change
  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // ✅ Mark all present/absent
  const markAll = (status) => {
    const updated = {};
    students.forEach((stu) => {
      updated[stu._id] = status;
    });
    setAttendance(updated);
  };

  // ✅ Submit attendance
  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) {
      return toast.error("Please select a class with students.");
    }

    // 🔐 Restrict backdate/future date
    if (date !== today) {
      return toast.error("❌ Attendance can only be marked for today.");
    }

    const confirm = window.confirm("Are you sure you want to submit the attendance?");
    if (!confirm) return;

    const className = selectedClass.slice(0, -1);
    const section = selectedClass.slice(-1).toUpperCase();

    const attendanceList = students.map((stu) => ({
      studentId: stu._id,
      studentName: stu.name,
      status: attendance[stu._id] || "Absent",
    }));

    try {
      await axios.post(
        "http://localhost:5000/api/attendance/mark",
        { className, section, date, attendanceList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Attendance marked successfully");
    } catch (err) {
      console.error("❌ Submit failed:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to submit attendance");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto font-poppins">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Mark Attendance</h1>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Select Class */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Select Class</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {assignedClasses.map((cls, idx) => (
              <option key={idx} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker (Locked) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            readOnly // ⛔ Prevent editing
            className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Mark All */}
        <div className="flex items-end gap-2 mt-2 md:mt-0">
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
            onClick={() => markAll("Present")}
          >
            ✅ All Present
          </button>
          <button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            onClick={() => markAll("Absent")}
          >
            ❌ All Absent
          </button>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" />
          Loading students...
        </div>
      ) : students.length > 0 ? (
        <div className="grid gap-4">
          {students.map((stu) => (
            <div
              key={stu._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between border rounded p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
                <p className="text-gray-800 font-medium">🎓 {stu.name}</p>
                <p className="text-gray-500 text-sm">Roll No: {stu.rollNumber || "N/A"}</p>
              </div>

              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <button
                  onClick={() => handleStatusChange(stu._id, "Present")}
                  className={`flex items-center gap-1 px-3 py-1 rounded border ${
                    attendance[stu._id] === "Present"
                      ? "bg-green-500 text-white"
                      : "bg-white text-green-600 border-green-500"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Present
                </button>
                <button
                  onClick={() => handleStatusChange(stu._id, "Absent")}
                  className={`flex items-center gap-1 px-3 py-1 rounded border ${
                    attendance[stu._id] === "Absent"
                      ? "bg-red-500 text-white"
                      : "bg-white text-red-600 border-red-500"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Absent
                </button>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
            >
              Submit Attendance
            </button>
          </div>
        </div>
      ) : (
        selectedClass && <p className="text-gray-600 mt-4">No students found.</p>
      )}
    </div>
  );
};

export default TeacherAttendance;
