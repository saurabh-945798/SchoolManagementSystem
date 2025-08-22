// src/pages/teacher/TeacherLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from '../Components/Dashboard/TeacherSidebar'; // adjust the path if needed

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-64 mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
