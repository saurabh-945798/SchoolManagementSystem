// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined for loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return <div className="text-center p-4">Loading...</div>;

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
