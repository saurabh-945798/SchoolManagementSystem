import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader, AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Use navigate hook

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem("teacherToken");
        if (!token) {
          console.warn("⚠️ No token found in localStorage");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/teacher-portal/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeacher(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch teacher profile:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    window.location.href = "/login";
  };

  const handleTakeAttendance = (className) => {
    // ✅ Navigate to attendance page and pass className as state
    navigate("/teacher-dashboard/attendance", { state: { className } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        <Loader className="animate-spin mr-2" /> Loading teacher dashboard...
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        <AlertCircle className="mr-2" /> Could not load teacher data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👨‍🏫 Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {teacher.name?.split(" ")[0]}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">👤 Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <p>
            <span className="font-medium">Name:</span> {teacher.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {teacher.email}
          </p>
          <p className="md:col-span-2">
            <span className="font-medium">Assigned Classes:</span>{" "}
            {Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0
              ? teacher.assignedClasses.join(", ")
              : <span className="text-red-500">No classes assigned yet</span>}
          </p>
        </div>
      </div>

      {/* Assigned Classes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">📚 Assigned Classes</h2>
        {teacher.assignedClasses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacher.assignedClasses.map((cls, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-indigo-600">Class {cls}</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Section:</span>{" "}
                  {cls.replace(/^\d+/, '')}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Class Level:</span>{" "}
                  {cls.match(/^\d+/)?.[0] || "N/A"}
                </p>
                <button
                  onClick={() => handleTakeAttendance(cls)} // ✅ Pass class name
                  className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md text-sm font-medium"
                >
                  Take Attendance
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No classes assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
