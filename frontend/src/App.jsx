import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AdminLayout from './Layouts/AdminLayout';
import StudentLayout from './Layouts/StudentLayout';
import TeacherLayout from './Layouts/TeacherLayout'; // ✅ New Layout

// Auth wrappers
import RequireAdminAuth from './Components/Auth/RequireAdminAuth';
import RedirectAfterLogin from './Components/Auth/RedirectAfterLogin';

// Pages: Public
import Login from './Components/Pages/Login';
import TeacherLogin from './Components/Pages/TeacherLogin';
import StudentLogin from './Components/Pages/StudentLogin';

// Pages: Admin
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import StudentSection from './Components/Dashboard/StudentSection';
import AddStudent from './Components/Dashboard/AddStudent';
import AdminTeachers from './Components/Dashboard/AdminTeachers';
import AllTeachers from './Components/Dashboard/AllTeachers';
import ManageResults from './Components/Dashboard/ManageResults';
import SubjectManager from './Components/Dashboard/SubjectManager';
import ResultHistory from './Components/Dashboard/ResultHistory';
import CreateMessage from './Components/Dashboard/CreateMessage';
import AllMessages from './Components/Dashboard/AllMessages';

// Pages: Student
import StudentDashboard from './Components/Dashboard/StudentDashboard';
import StudentAttendance from './Components/Dashboard/StudentAttendance';
import StudentResults from './Components/Dashboard/StudentResults';
import StudentFees from './Components/Dashboard/StudentFees';

// Pages: Teacher
import TeacherDashboard from './Components/Dashboard/TeacherDashboard';
import TeacherAttendance from './Components/Dashboard/TeacherAttendance'; // create this if needed
import TeacherProfile from './Components/Dashboard/TeacherProfile';       // create this if needed
import TeacherMessages from './Components/Dashboard/TeacherMessages';   // create this if needed
import ManageClasses from './Components/Dashboard/ManageClasses';
import ManageFees from './Components/Dashboard/ManageFees';
import AllFees from './Components/Dashboard/AllFees';
import AdminFeePayments from './Components/Dashboard/Payment'; 
import StudentFeeHistory from './Components/Dashboard/StudentFeeHistory';
import StudentMessages from './Components/Dashboard/StudentMessages';
import FeeDefaulters from './Components/Dashboard/FeeDefaulters';
import AdminHomeworkUploader from './Components/Dashboard/AdminHomeworkUploader';
import AdminCalendar from './Components/Dashboard/AdminCalendar';
import StudentCalendar from './Components/Dashboard/StudentCalendar';
import StudentLeaveForm from './Components/Dashboard/StudentLeaveForm';
import AdminLeaveManager from './Components/Dashboard/AdminLeaveManager';
import StudentComplaint from './Components/Dashboard/StudentComplaint';
import AdminComplaints from './Components/Dashboard/AdminComplaints';
import TimetableEditor from './Components/Dashboard/TimetableEditor';
import AllTimetables from './Components/Dashboard/AllTimetablesPage';
import StudentTimetable from './Components/Dashboard/StudentTimetable';
import AbsentStudents from './Components/Dashboard/AbsentStudents';
import ClasswiseAttendance from './Components/Dashboard/ClasswiseAttendance';
import AdminUpdateStudentFees from './Components/Dashboard/AdminUpdateStudentFees';
import OfflineFeeReceipt from './Components/Dashboard/OfflineFeeReceipt';
// ✅ General Auth
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('teacherToken');
  return token ? children : <Navigate to="/sign-in" replace />;
};

// ✅ Student Auth
const RequireStudentAuth = ({ children }) => {
  const token = localStorage.getItem('studentToken');
  return token ? children : <Navigate to="/student-login" replace />;
};

// ✅ Teacher Auth
const RequireTeacherAuth = ({ children }) => {
  const token = localStorage.getItem('teacherToken');
  return token ? children : <Navigate to="/teacher-login" replace />;
};

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/* 🔄 Redirect after login */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <RedirectAfterLogin />
            </RequireAuth>
          }
        />

        {/* 🔓 Public Routes */}
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<div>Sign Up Page</div>} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />


        {/* 🛠 Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-students"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <StudentSection />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-students/add"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AddStudent />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-teachers"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminTeachers />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-teachers/AllTeachers"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AllTeachers />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-results"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <ManageResults />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-results/history"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <ResultHistory />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin-results/subjects"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <SubjectManager />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/messages/create"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <CreateMessage />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/messages/all"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AllMessages />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />


        <Route
          path="/admin/manage-classes"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <ManageClasses />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/fees/manage"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <ManageFees />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />



        <Route
          path="/admin/fees/all"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AllFees />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/fees/payments"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminFeePayments />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin/fees/feeDefaulters"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <FeeDefaulters />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />


        <Route
          path="/admin/complaints"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminComplaints />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />




        <Route
          path="/admin-homework-upload"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminHomeworkUploader />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin-calendar"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminCalendar />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin-leaves"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AdminLeaveManager />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />

        <Route
          path="/admin-all-timetables"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <AllTimetables />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />



        <Route
          path="/admin-timetable"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <TimetableEditor />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />



      <Route
        path="/admin-absentees"
        element={
          <RequireAdminAuth>
            <AdminLayout>
              <AbsentStudents />
            </AdminLayout>
          </RequireAdminAuth>
        }
      />

      <Route
        path="/admin-classwise-attendance"
        element={
          <RequireAdminAuth>
            <AdminLayout>
              <ClasswiseAttendance />
            </AdminLayout>
          </RequireAdminAuth>
        }
      />


      <Route
        path="/admin/fees/offline-payment"
        element={
          <RequireAdminAuth>
            <AdminLayout>
              <AdminUpdateStudentFees /> {/* ✅ Ye wahi page hai jo humne banaya tha */}
            </AdminLayout>
          </RequireAdminAuth>
        }
      />





      <Route
        path="/admin-offline-fee-receipt"
        element={
          <RequireAdminAuth>
            <AdminLayout>
              <OfflineFeeReceipt />
            </AdminLayout>
          </RequireAdminAuth>
        }
      />



      


      





        {/* 🧑‍🏫 Teacher Dashboard (with Layout) */}
        <Route
          path="/teacher-dashboard"
          element={
            <RequireTeacherAuth>
              <TeacherLayout />
            </RequireTeacherAuth>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="messages" element={<TeacherMessages />} />
        </Route>

        {/* 🎓 Student Dashboard (with Layout) */}
        <Route
          path="/student-dashboard"
          element={
            <RequireStudentAuth>
              <StudentLayout />
            </RequireStudentAuth>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="calendar" element={<StudentCalendar />} /> {/* ✅ Academic Calendar */}


          <Route path="fee-history" element={<StudentFeeHistory />} /> {/* ✅ Added this */}
          <Route path="apply-leave" element={<StudentLeaveForm />} /> {/* ✅ Leave Form Route */}
          <Route path="student-complaint" element={<StudentComplaint />} />
          <Route path="student-timetable" element={<StudentTimetable />} />




        </Route>

        {/* 🚫 Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="text-center mt-16 text-xl font-semibold text-red-600">
              🚫 Unauthorized Access
            </div>
          }
        />

        {/* 404 Page Not Found */}
        <Route
          path="*"
          element={
            <div className="text-center mt-16 text-xl font-semibold text-gray-700">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
