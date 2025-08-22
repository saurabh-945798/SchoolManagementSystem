// src/Layouts/AdminLayout.jsx
import React from 'react';
import Sidebar from '../Components/Dashboard/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 pt-24 md:pt-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
