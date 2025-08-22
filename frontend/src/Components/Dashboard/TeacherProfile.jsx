import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherProfile = () => {
  const [teacher, setTeacher] = useState(null);

  const fetchTeacherInfo = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      const res = await axios.get('http://localhost:5000/api/teacher-portal/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeacher(res.data);
    } catch (err) {
      toast.error('❌ Failed to load teacher info');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  if (!teacher) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">👨‍🏫 Teacher Profile</h2>
      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Name:</strong> {teacher.name}</p>
        <p><strong>Email:</strong> {teacher.email}</p>
        <p><strong>Phone:</strong> {teacher.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> {teacher.subject || 'N/A'}</p>
        <p><strong>Assigned Classes:</strong> {teacher.assignedClasses?.join(', ') || 'None'}</p>
        <p><strong>Joining Date:</strong> {new Date(teacher.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default TeacherProfile;
