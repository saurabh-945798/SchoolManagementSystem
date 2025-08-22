// src/utils/RequireAdminAuth.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdminAuth = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RequireAdminAuth;
