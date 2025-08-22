import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  UsersIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon, // For timetable
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [teachersOpen, setTeachersOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);
  const [leavesOpen, setLeavesOpen] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);


  const location = useLocation();
  const sidebarRef = useRef();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleStudents = () => setStudentsOpen(!studentsOpen);
  const toggleTeachers = () => setTeachersOpen(!teachersOpen);
  const toggleResults = () => setResultsOpen(!resultsOpen);
  const toggleMessages = () => setMessagesOpen(!messagesOpen);
  const toggleClasses = () => setClassesOpen(!classesOpen);
  const toggleFees = () => setFeesOpen(!feesOpen);
  const toggleLeaves = () => setLeavesOpen(!leavesOpen);
  const toggleTimetable = () => setTimetableOpen(!timetableOpen);
  const toggleAttendance = () => setAttendanceOpen(!attendanceOpen);


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
    localStorage.removeItem('adminToken');
    window.location.href = '/sign-in';
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md font-semibold">
        <h2 className="text-xl font-bold tracking-wide font-inter">Admin Panel</h2>
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
            Admin Panel
          </h2>

          <ul className="space-y-6 text-sm font-medium">
            {/* Dashboard */}
            <li>
              <Link
                to="/admin-dashboard"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/admin-dashboard' ? 'text-indigo-600' : ''
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
                Dashboard
              </Link>
            </li>

            {/* Timetable */}
            <li>
  <button
    onClick={toggleTimetable}
    className="flex items-center justify-between w-full hover:text-indigo-600"
  >
    <div className="flex items-center gap-4">
      <CalendarDaysIcon className="w-5 h-5" />
      Timetable
    </div>
    {timetableOpen ? (
      <ChevronUpIcon className="w-5 h-5" />
    ) : (
      <ChevronDownIcon className="w-5 h-5" />
    )}
  </button>

  {timetableOpen && (
    <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
      <li>
        <Link
          to="/admin-timetable"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin-timetable" ? "text-indigo-600" : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> Manage Timetable
        </Link>
      </li>

      <li>
        <Link
          to="/admin-all-timetables"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin-all-timetables"
              ? "text-indigo-600"
              : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> View All Timetables
        </Link>
      </li>
    </ul>
  )}
</li>


            {/* Manage Teacher */}
            <li>
              <button onClick={toggleTeachers} className="flex items-center justify-between w-full hover:text-indigo-600">
                <div className="flex items-center gap-4">
                  <UsersIcon className="w-5 h-5" />
                  Manage Teacher
                </div>
                {teachersOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              {teachersOpen && (
                <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      to="/admin-teachers"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-teachers' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> Add Teacher
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin-teachers/AllTeachers"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-teachers/AllTeachers' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <PlusIcon className="w-4 h-4" /> All Teacher
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Students */}
            <li>
              <button onClick={toggleStudents} className="flex items-center justify-between w-full hover:text-indigo-600">
                <div className="flex items-center gap-4">
                  <AcademicCapIcon className="w-5 h-5" />
                  Students
                </div>
                {studentsOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              {studentsOpen && (
                <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      to="/admin-students"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-students' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> All Students
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin-students/add"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-students/add' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <PlusIcon className="w-4 h-4" /> Add Student
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Results */}
            <li>
              <button onClick={toggleResults} className="flex items-center justify-between w-full hover:text-indigo-600">
                <div className="flex items-center gap-4">
                  <CheckCircleIcon className="w-5 h-5" />
                  Results
                </div>
                {resultsOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              {resultsOpen && (
                <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      to="/admin-results"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-results' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> Manage Results
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin-results/history"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-results/history' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> Result History
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin-results/subjects"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-results/subjects' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> Subject Manager
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Messages */}
            <li>
              <button onClick={toggleMessages} className="flex items-center justify-between w-full hover:text-indigo-600">
                <div className="flex items-center gap-4">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Messages
                </div>
                {messagesOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              {messagesOpen && (
                <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      to="/admin/messages/all"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin/messages/all' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" /> All Messages
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/messages/create"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin/messages/create' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <PlusIcon className="w-4 h-4" /> Create Message
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Fees */}
            <li>
  <button
    onClick={toggleFees}
    className="flex items-center justify-between w-full hover:text-indigo-600"
  >
    <div className="flex items-center gap-4">
      <CheckCircleIcon className="w-5 h-5" />
      Fees
    </div>
    {feesOpen ? (
      <ChevronUpIcon className="w-5 h-5" />
    ) : (
      <ChevronDownIcon className="w-5 h-5" />
    )}
  </button>
  {feesOpen && (
    <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
      <li>
        <Link
          to="/admin/fees/manage"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin/fees/manage" ? "text-indigo-600" : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> Manage Fees
        </Link>
      </li>
      <li>
        <Link
          to="/admin/fees/all"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin/fees/all" ? "text-indigo-600" : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> All Fees
        </Link>
      </li>
      <li>
        <Link
          to="/admin/fees/payments"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin/fees/payments"
              ? "text-indigo-600"
              : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> Payments
        </Link>
      </li>
      <li>
        <Link
          to="/admin/fees/feeDefaulters"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin/fees/feeDefaulters"
              ? "text-indigo-600"
              : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> Fee Defaulters
        </Link>
      </li>

      {/* ✅ New Manual Payment Page */}
      <li>
        <Link
          to="/admin/fees/offline-payment"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin/fees/offline-payment"
              ? "text-indigo-600"
              : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" /> Record Offline Payment
        </Link>
      </li>
    </ul>
  )}
</li>


            {/* Leaves */}
            <li>
              <button onClick={toggleLeaves} className="flex items-center justify-between w-full hover:text-indigo-600">
                <div className="flex items-center gap-4">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                  Leave Requests
                </div>
                {leavesOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              {leavesOpen && (
                <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
                  <li>
                    <Link
                      to="/admin-leaves"
                      className={`flex items-center gap-2 hover:text-indigo-600 ${
                        location.pathname === '/admin-leaves' ? 'text-indigo-600' : ''
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                      Manage Leaves
                    </Link>
                  </li>
                </ul>
              )}
            </li>




            <li>
  <button
    onClick={toggleAttendance}
    className="flex items-center justify-between w-full hover:text-indigo-600"
  >
    <div className="flex items-center gap-4">
      <ClipboardDocumentCheckIcon className="w-5 h-5" />
      Attendance
    </div>
    {attendanceOpen ? (
      <ChevronUpIcon className="w-5 h-5" />
    ) : (
      <ChevronDownIcon className="w-5 h-5" />
    )}
  </button>

  {attendanceOpen && (
    <ul className="ml-8 mt-3 space-y-3 text-sm font-normal">
      <li>
        <Link
          to="/admin-absentees"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin-absentees" ? "text-indigo-600" : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" />
          Absent Students
        </Link>
      </li>
      <li>
        {/* <Link
          to="/admin-classwise-attendance"
          className={`flex items-center gap-2 hover:text-indigo-600 ${
            location.pathname === "/admin-classwise-attendance" ? "text-indigo-600" : ""
          }`}
        >
          <ListBulletIcon className="w-4 h-4" />
          Classwise Attendance
        </Link> */}
      </li>
    </ul>
  )}
</li>



            {/* Complaints */}
            <li>
              <Link
                to="/admin/complaints"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/admin/complaints' ? 'text-indigo-600' : ''
                }`}
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                Complaints
              </Link>
            </li>

            {/* Calendar */}
            <li>
              <Link
                to="/admin-calendar"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/admin-calendar' ? 'text-indigo-600' : ''
                }`}
              >
                <AcademicCapIcon className="w-5 h-5" />
                Academic Calendar
              </Link>
            </li>

            {/* Settings */}
            <li>
              <Link
                to="/admin-settings"
                className={`flex items-center gap-4 hover:text-indigo-600 ${
                  location.pathname === '/admin-settings' ? 'text-indigo-600' : ''
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Logout */}
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

      {/* Overlay for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;
