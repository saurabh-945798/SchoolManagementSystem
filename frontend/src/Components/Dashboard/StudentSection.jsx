// StudentSection.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const classList = [
  'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9',
  'Class 10', 'Class 11', 'Class 12',
];

const itemsPerPage = 10;

const StudentSection = () => {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', class: '', section: '',
    studentPhone: '', fatherName: '', fatherPhone: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/students?class=${selectedClass}`);
      setStudents(res.data);
      setCurrentPage(1);
    } catch (err) {
      setError('❌ Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/students/${editingStudent._id}`, formData);
      toast.success('✅ Student updated');
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      toast.success('🗑 Student deleted');
      fetchStudents();
    } catch {
      toast.error('❌ Delete failed');
    }
  };

  const closeModal = () => setEditingStudent(null);

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6 md:p-10 font-inter">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-tight">
        🎓 Student Management Dashboard
      </h1>

      {/* Class Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {classList.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 shadow-sm ${
              selectedClass === cls
                ? 'bg-indigo-700 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="🔍 Search by name or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto p-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          👥 Students of <span className="text-indigo-600">{selectedClass}</span>
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">⏳ Loading students...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : currentStudents.length === 0 ? (
          <p className="text-center text-gray-600">No students found.</p>
        ) : (
          <>
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-indigo-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Roll No.</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Section</th>
                  <th className="p-3 text-left">Student Phone</th>
                  <th className="p-3 text-left">Father</th>
                  <th className="p-3 text-left">Father Phone</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-indigo-50 transition">
                    <td className="p-3 border-b">{s.rollNumber}</td>
                    <td className="p-3 border-b">{s.name}</td>
                    <td className="p-3 border-b">{s.class}</td>
                    <td className="p-3 border-b">{s.section}</td>
                    <td className="p-3 border-b">{s.studentPhone}</td>
                    <td className="p-3 border-b">{s.fatherName}</td>
                    <td className="p-3 border-b">{s.fatherPhone}</td>
                    <td className="p-3 border-b whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-700 transition"
                      >
                        <Pencil className="inline w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="bg-red-600 text-white px-2.5 py-1 rounded ml-2 hover:bg-red-700 transition"
                      >
                        <Trash2 className="inline w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-6 flex justify-center gap-4 text-sm font-medium">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">
              ✏️ Edit Student - {editingStudent.name}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {['name', 'rollNumber', 'class', 'section', 'studentPhone', 'fatherName', 'fatherPhone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSection;
