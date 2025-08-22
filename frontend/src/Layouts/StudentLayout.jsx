import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../Components/Dashboard/StudentSidebar'; // adjust the path if needed

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main content */}
      <main className="flex-1 p-4 md:ml-64 mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
