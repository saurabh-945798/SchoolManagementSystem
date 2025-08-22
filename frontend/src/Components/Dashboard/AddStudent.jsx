import React, { useState } from 'react';
import axios from 'axios';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const classes = [
  'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    class: '',
    section: '',
    dob: '',
    rollNumber: '',
    email: '',
    studentPhone: '',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    motherPhone: '',
    fatherOccupation: '',
    motherOccupation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const normalizeClass = (cls) => {
    if (cls.startsWith('Class ')) {
      return cls.replace('Class ', '');
    }
    return cls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        class: normalizeClass(formData.class),
        section: formData.section.toUpperCase(),
      };
  
      console.log("📤 Payload:", payload); // 👈 Yeh line yahan daal
  
      await axios.post('http://localhost:5000/api/students', payload);
      alert('✅ Student added successfully!');
      // reset code...
    } catch (error) {
      console.error('❌ Failed to add student:', error);
      console.log("🔍 Backend Error Message:", error?.response?.data); // 👈 Yeh line yahan daal
      alert('❌ Error adding student. Please check details or try again.');
    }
  };
  

  const inputStyle = "border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const LabelWithIcon = ({ icon: Icon, label }) => (
    <label className="flex items-center gap-2 font-medium text-gray-700">
      <Icon className="w-5 h-5 text-indigo-600" />
      {label}
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-6">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">🎓 Add New Student</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LabelWithIcon icon={UserIcon} label="Full Name" />
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={UserIcon} label="Gender" />
          <select name="gender" value={formData.gender} onChange={handleChange} required className={inputStyle}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <LabelWithIcon icon={IdentificationIcon} label="Class" />
          <select name="class" value={formData.class} onChange={handleChange} required className={inputStyle}>
            <option value="">Select Class</option>
            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        <div>
          <LabelWithIcon icon={UserGroupIcon} label="Section" />
          <input type="text" name="section" value={formData.section} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={CalendarDaysIcon} label="Date of Birth" />
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={IdentificationIcon} label="Roll Number" />
          <input type="number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={EnvelopeIcon} label="Email" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={PhoneIcon} label="Student Phone" />
          <input type="text" name="studentPhone" value={formData.studentPhone} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={UserIcon} label="Father's Name" />
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={UserIcon} label="Mother's Name" />
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={PhoneIcon} label="Father's Phone" />
          <input type="text" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={PhoneIcon} label="Mother's Phone" />
          <input type="text" name="motherPhone" value={formData.motherPhone} onChange={handleChange} required className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={UserIcon} label="Father's Occupation" />
          <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className={inputStyle} />
        </div>

        <div>
          <LabelWithIcon icon={UserIcon} label="Mother's Occupation" />
          <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className={inputStyle} />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md text-lg font-semibold shadow transition duration-300">
            ➕ Add Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
