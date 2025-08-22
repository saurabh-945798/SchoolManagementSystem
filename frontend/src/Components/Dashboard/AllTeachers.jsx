import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const fallbackImg =
  'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // generic avatar fallback

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      toast.error('❌ Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${id}`);
      toast.success('🗑️ Teacher deleted');
      fetchTeachers();
    } catch {
      toast.error('❌ Delete failed');
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      gender: teacher.gender || '',
      dob: teacher.dob ? new Date(teacher.dob).toISOString().slice(0, 10) : '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      address: teacher.address || '',
      photoUrl: teacher.photoUrl || '',
      teacherID: teacher.teacherID || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience != null ? teacher.experience : '',
      subjects: (teacher.subjects || []).join(', '),
      classesAssigned: (teacher.classesAssigned || []).join(', '),
      department: teacher.department || '',
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().slice(0, 10) : '',
      teacherType: teacher.teacherType || '',
      role: teacher.role || 'teacher',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async () => {
    try {
      const payload = {
        ...editForm,
        experience: Number(editForm.experience),
        subjects: editForm.subjects
          ? editForm.subjects.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        classesAssigned: editForm.classesAssigned
          ? editForm.classesAssigned.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
          : [],
        dob: editForm.dob ? new Date(editForm.dob) : null,
        joiningDate: editForm.joiningDate ? new Date(editForm.joiningDate) : null,
      };

      await axios.put(`http://localhost:5000/api/teachers/update/${editingTeacher._id}`, payload);
      toast.success('✅ Teacher updated successfully');
      setEditingTeacher(null);
      fetchTeachers();
    } catch {
      toast.error('❌ Update failed');
    }
  };

  const renderChips = (items) =>
    (items || []).map((item, idx) => (
      <span
        key={idx}
        className="inline-block px-3 py-1 mr-2 mb-2 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"
      >
        {item}
      </span>
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-6 font-poppins md:ml-64">
      <h1 className="text-4xl font-bold mb-10 text-indigo-700 flex items-center gap-3">
        📋 All Teachers
      </h1>

      {loading ? (
        <div className="text-center text-indigo-600 font-semibold text-xl">Loading...</div>
      ) : teachers.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-20">No teachers found.</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {teachers.map((teacher) => (
            <motion.div
              key={teacher._id}
              className="bg-white rounded-3xl shadow-lg p-6 flex flex-col"
              whileHover={{ scale: 1.03, boxShadow: '0 25px 40px rgba(99, 102, 241, 0.3)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              layout
            >
              {/* Photo + name */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={teacher.photoUrl || fallbackImg}
                  alt={teacher.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-400 shadow-md"
                  onError={(e) => (e.target.src = fallbackImg)}
                />
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-700">{teacher.name}</h2>
                  <div className="text-indigo-500 text-sm">{teacher.teacherID || 'ID N/A'}</div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => openEditModal(teacher)}
                    title="Edit"
                    className="p-2 rounded-full hover:bg-indigo-100 transition text-indigo-600"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher._id)}
                    title="Delete"
                    className="p-2 rounded-full hover:bg-red-100 transition text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1 text-gray-700 text-sm">
                <div><b>Email:</b> {teacher.email || '-'}</div>
                <div><b>Gender:</b> {teacher.gender || '-'}</div>
                <div><b>DOB:</b> {formatDate(teacher.dob)}</div>
                <div><b>Phone:</b> {teacher.phone || '-'}</div>
                <div><b>Address:</b> {teacher.address || '-'}</div>
                <div><b>Qualification:</b> {teacher.qualification || '-'}</div>
                <div><b>Experience:</b> {teacher.experience != null ? teacher.experience + ' years' : '-'}</div>
                <div>
                  <b>Subjects:</b> <br />
                  {renderChips(teacher.subjects)}
                </div>
                <div>
                  <b>Classes Assigned:</b> <br />
                  {renderChips(teacher.classesAssigned)}
                </div>
                <div><b>Department:</b> {teacher.department || '-'}</div>
                <div><b>Joining Date:</b> {formatDate(teacher.joiningDate)}</div>
                <div><b>Teacher Type:</b> {teacher.teacherType || '-'}</div>
                <div><b>Role:</b> {teacher.role || '-'}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTeacher && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={() => setEditingTeacher(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                aria-label="Close edit modal"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold mb-6 text-indigo-600">Edit Teacher</h3>

              <div className="space-y-5">
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  name="dob"
                  value={editForm.dob}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  placeholder="Address"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="photoUrl"
                  value={editForm.photoUrl}
                  onChange={handleEditChange}
                  placeholder="Photo URL"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="teacherID"
                  value={editForm.teacherID}
                  onChange={handleEditChange}
                  placeholder="Teacher ID"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="qualification"
                  value={editForm.qualification}
                  onChange={handleEditChange}
                  placeholder="Qualification"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="number"
                  name="experience"
                  value={editForm.experience}
                  onChange={handleEditChange}
                  placeholder="Experience (years)"
                  min="0"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="subjects"
                  value={editForm.subjects}
                  onChange={handleEditChange}
                  placeholder="Subjects (comma separated)"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="classesAssigned"
                  value={editForm.classesAssigned}
                  onChange={handleEditChange}
                  placeholder="Classes Assigned (comma separated)"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  placeholder="Department"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="date"
                  name="joiningDate"
                  value={editForm.joiningDate}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="teacherType"
                  value={editForm.teacherType}
                  onChange={handleEditChange}
                  placeholder="Teacher Type"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />

                <input
                  type="text"
                  name="role"
                  value={editForm.role}
                  readOnly
                  className="w-full border border-gray-200 bg-gray-100 px-4 py-3 rounded-xl text-lg text-gray-500 cursor-not-allowed"
                />

                <button
                  onClick={submitEdit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllTeachers;
