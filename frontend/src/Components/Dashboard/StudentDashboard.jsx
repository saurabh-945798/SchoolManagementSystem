import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { UserCircleIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { FaUserGraduate, FaEnvelope } from 'react-icons/fa';
import AttendanceSummary from './AttendanceSummary';
import ResultSummary from './ResultSummary';
import ComplaintSummary from './ComplaintSummary';
import FeeSummary from './FeeSummary';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentInfo = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) throw new Error('No student token found');

      const res = await axios.get('/api/auth/student/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudent(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch student info:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center text-red-600 mt-20 text-lg font-medium px-4">
        ⚠️ Student info could not be loaded. Please try logging in again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-white/50"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 break-words">
                Hi, {student.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Welcome to your dashboard 🎉</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8"
        >
          <AnimatedInfoCard icon={<FaUserGraduate />} label="Roll Number" value={student.rollNumber} />
          <AnimatedInfoCard icon={<AcademicCapIcon className="w-5 h-5" />} label="Class" value={`${student.class} - ${student.section}`} />
          <AnimatedInfoCard icon={<FaEnvelope />} label="Email" value={student.email} />
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="space-y-6"
        >
          {/* Row 1: Attendance + Result */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AttendanceSummary />
            <ResultSummary />
          </div>

          {/* Row 2: Fees + Complaints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <FeeSummary />
            <ComplaintSummary />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500">
          <AcademicCapIcon className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 text-indigo-400" />
          Keep learning, keep growing! 🌱
        </div>
      </motion.div>
    </div>
  );
};

// Animated InfoCard component
const AnimatedInfoCard = ({ icon, label, value }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="bg-white/70 border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-1 text-indigo-600 text-base sm:text-lg">
        <span className="text-lg sm:text-xl">{icon}</span>
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-gray-700 text-xs sm:text-sm break-words">{value}</p>
    </motion.div>
  );
};

export default StudentDashboard;
