import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeOpenIcon,
  PencilSquareIcon,
  ClockIcon // ⏰ icon for timetable
} from '@heroicons/react/24/outline';
import axios from 'axios';

const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feeDropdownOpen, setFeeDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const sidebarRef = useRef();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleFeeDropdown = () => setFeeDropdownOpen(!feeDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    window.location.href = '/student-login';
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const student = JSON.parse(localStorage.getItem('studentData'));
      const token = localStorage.getItem('studentToken');
      if (!student || !token) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/student/unread/${student._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md font-semibold">
        <h2 className="text-xl font-bold tracking-wide font-inter">Student Portal</h2>
        <button onClick={toggleSidebar}>
          {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`bg-white text-gray-800 w-64 min-h-screen pt-20 md:pt-6 p-6 fixed top-0 left-0 z-40 transition-transform duration-300 transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:block shadow-xl font-inter flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-2xl font-extrabold text-indigo-700 mb-10 hidden md:block tracking-wide font-inter">
            Student Portal
          </h2>

          <ul className="space-y-6 text-sm font-medium">
            <li>
              <Link
                to="/student-dashboard"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard') ? 'text-indigo-600' : ''
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/student-dashboard/attendance"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/attendance') ? 'text-indigo-600' : ''
                }`}
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Attendance
              </Link>
            </li>

            <li>
              <Link
                to="/student-dashboard/results"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/results') ? 'text-indigo-600' : ''
                }`}
              >
                <CheckCircleIcon className="w-5 h-5" />
                Results
              </Link>
            </li>

            <li>
              <Link
                to="/student-dashboard/calendar"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/calendar') ? 'text-indigo-600' : ''
                }`}
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Calendar
              </Link>
            </li>

            {/* ✅ NEW Time Table Link */}
            <li>
              <Link
                to="/student-dashboard/student-timetable"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/student-timetable') ? 'text-indigo-600' : ''
                }`}
              >
                <ClockIcon className="w-5 h-5" />
                Time Table
              </Link>
            </li>

            <li>
              <Link
                to="/student-dashboard/apply-leave"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/apply-leave') ? 'text-indigo-600' : ''
                }`}
              >
                <EnvelopeOpenIcon className="w-5 h-5" />
                Apply Leave
              </Link>
            </li>

            {/* Complaint */}
            <li>
              <Link
                to="/student-dashboard/student-complaint"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  isActive('/student-dashboard/student-complaint') ? 'text-indigo-600' : ''
                }`}
              >
                <PencilSquareIcon className="w-5 h-5" />
                File Complaint
              </Link>
            </li>

            {/* Fees Dropdown */}
            <li>
              <div
                onClick={toggleFeeDropdown}
                className="flex items-center justify-between cursor-pointer hover:text-indigo-600"
              >
                <div className="flex items-center gap-4">
                  <BanknotesIcon className="w-5 h-5" />
                  <span
                    className={`${
                      location.pathname.includes('/student-dashboard/fees') ||
                      location.pathname.includes('/student-dashboard/fee-history')
                        ? 'text-indigo-600'
                        : ''
                    }`}
                  >
                    Fees
                  </span>
                </div>
                {feeDropdownOpen ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </div>

              {feeDropdownOpen && (
                <ul className="mt-2 ml-6 space-y-3 text-sm">
                  <li>
                    <Link
                      to="/student-dashboard/fees"
                      className={`block hover:text-indigo-600 ${
                        isActive('/student-dashboard/fees') ? 'text-indigo-600 font-semibold' : ''
                      }`}
                    >
                      💳 Pay Fee
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/student-dashboard/fee-history"
                      className={`block hover:text-indigo-600 ${
                        isActive('/student-dashboard/fee-history')
                          ? 'text-indigo-600 font-semibold'
                          : ''
                      }`}
                    >
                      📜 Fee History
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Messages */}
            <li>
              <Link
                to="/student-dashboard/messages"
                className={`flex items-center gap-4 relative hover:text-indigo-600 ${
                  isActive('/student-dashboard/messages') ? 'text-indigo-600' : ''
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-300">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-600 hover:text-red-800 font-semibold"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default StudentSidebar;
