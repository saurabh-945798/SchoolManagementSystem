// src/components/Layouts/TeacherSidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const TeacherSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef();

  const toggleSidebar = () => setIsOpen(!isOpen);

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
    localStorage.removeItem('teacherToken');
    window.location.href = '/teacher-login';
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md font-semibold">
        <h2 className="text-xl font-bold tracking-wide font-inter">Teacher Portal</h2>
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
            Teacher Portal
          </h2>

          <ul className="space-y-6 text-sm font-medium">
            <li>
              <Link
                to="/teacher-dashboard"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/teacher' ? 'text-indigo-600' : ''
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/teacher-dashboard/attendance"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/teacher-dashboard/attendance' ? 'text-indigo-600' : ''
                }`}
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                Attendance
              </Link>
            </li>

            <li>
              <Link
                to="/teacher-dashboard/profile"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/teacher/profile' ? 'text-indigo-600' : ''
                }`}
              >
                <UserIcon className="w-5 h-5" />
                Personal Info
              </Link>
            </li>

            <li>
              <Link
                to="/teacher-dashboard/messages"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/teacher-dashboard/messages' ? 'text-indigo-600' : ''
                }`}
              >
                <InboxIcon className="w-5 h-5" />
                Messages
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

export default TeacherSidebar;
