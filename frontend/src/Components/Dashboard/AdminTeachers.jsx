import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const AddTeacher = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const isEdit = Boolean(teacherId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    dob: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    department: '',
    joiningDate: '',
    teacherType: '',
    teacherID: '',
    subjects: '',
    classesAssigned: '',
  });

  useEffect(() => {
    if (isEdit) fetchTeacher();
  }, [isEdit]);

  const fetchTeacher = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`);
      const t = res.data;
      setFormData({
        ...t,
        subjects: (t.subjects || []).join(', '),
        classesAssigned: (t.classesAssigned || []).join(', '),
        dob: t.dob?.split('T')[0] || '',
        joiningDate: t.joiningDate?.split('T')[0] || '',
        password: '', // Don't pre-fill password
      });
    } catch {
      toast.error('❌ Failed to load teacher');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        gender: formData.gender.trim(),
        subjects: formData.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        classesAssigned: formData.classesAssigned
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
      };

      if (!payload.teacherID || payload.teacherID.trim() === '') {
        delete payload.teacherID;
      }

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/teachers/update/${teacherId}`, payload);
        toast.success('✅ Teacher updated successfully');
      } else {
        if (!formData.password) {
          toast.warning('⚠️ Password is required to create a teacher');
          return;
        }
        await axios.post('http://localhost:5000/api/auth/teacher/admin-create', payload);
        toast.success('✅ Teacher created successfully');
      }

      navigate('/admin-teachers');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || '❌ Operation failed';

      if (errorMsg.toLowerCase().includes('email')) {
        toast.error('❌ Email already exists. Try another one.');
      } else if (errorMsg.toLowerCase().includes('teacher id')) {
        toast.error('❌ Teacher ID already exists. Use a unique ID.');
      } else {
        toast.error(`❌ ${errorMsg}`);
      }
    }
  };

  return (
    <div className="p-6 md:ml-64 bg-gray-100 min-h-screen font-poppins">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          {isEdit ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required className="border px-3 py-2 rounded" />
          {!isEdit && (
            <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required className="border px-3 py-2 rounded" />
          )}
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="border px-3 py-2 rounded" />

          <select name="gender" value={formData.gender} onChange={handleChange} required className="border px-3 py-2 rounded">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input name="dob" type="date" placeholder="DOB" value={formData.dob} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="experience" type="number" placeholder="Experience (years)" value={formData.experience} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="teacherType" placeholder="Teacher Type (PGT/TGT)" value={formData.teacherType} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="joiningDate" type="date" placeholder="Joining Date" value={formData.joiningDate} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="teacherID" placeholder="Teacher ID (Optional)" value={formData.teacherID} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="subjects" placeholder="Subjects (comma-separated)" value={formData.subjects} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="classesAssigned" placeholder="Assigned Classes (comma-separated)" value={formData.classesAssigned} onChange={handleChange} className="border px-3 py-2 rounded" />
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="border px-3 py-2 rounded col-span-full" />

          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded col-span-full mt-2">
            {isEdit ? 'Update Teacher' : 'Create Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
