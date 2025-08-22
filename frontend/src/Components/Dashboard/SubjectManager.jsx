import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [className, setClassName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsedClasses, setCollapsedClasses] = useState({});

  const token = localStorage.getItem('adminToken');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/subjects/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (!className || !newSubject) return toast.warn('Fill both fields');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/subjects',
        { className, name: newSubject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Subject added');
      setNewSubject('');
      setClassName('');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding subject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Deleted');
      fetchSubjects();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleUpdate = async () => {
    if (!editingSubject.className || !editingSubject.name) return;
    try {
      await axios.put(
        `http://localhost:5000/api/subjects/${editingSubject._id}`,
        editingSubject,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Updated');
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const toggleCollapse = (cls) => {
    setCollapsedClasses((prev) => ({
      ...prev,
      [cls]: !prev[cls],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-inter">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">📘 Subject Management</h2>

      {/* Add Subject Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Add New Subject</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-32 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="Class (e.g. 10)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="Subject name"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button
            onClick={handleAddSubject}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition flex items-center justify-center"
          >
            <Plus size={18} className="mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Subject List */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">📚 Subjects by Class</h3>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} /> Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500">No subjects found.</p>
        ) : (
          Object.entries(
            subjects.reduce((acc, curr) => {
              acc[curr.className] = acc[curr.className] || [];
              acc[curr.className].push(curr);
              return acc;
            }, {})
          ).map(([cls, subs]) => (
            <div key={cls} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCollapse(cls)}
                className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 px-4 py-3 transition"
              >
                <h4 className="text-md font-semibold text-indigo-700">
                  🎓 Class {cls}
                </h4>
                {collapsedClasses[cls] ? (
                  <ChevronRight className="text-indigo-600" size={20} />
                ) : (
                  <ChevronDown className="text-indigo-600" size={20} />
                )}
              </button>

              {!collapsedClasses[cls] && (
                <ul className="space-y-2 p-4 bg-white">
                  {subs.map((sub) => (
                    <li
                      key={sub._id}
                      className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2 hover:shadow transition"
                    >
                      {editingSubject?._id === sub._id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            value={editingSubject.name}
                            onChange={(e) =>
                              setEditingSubject({ ...editingSubject, name: e.target.value })
                            }
                            className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                          />
                          <button
                            onClick={handleUpdate}
                            className="text-green-600 font-semibold hover:underline"
                          >
                            ✅ Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-gray-800 font-medium">{sub.name}</span>
                          <div className="flex gap-3 items-center">
                            <button
                              onClick={() => setEditingSubject(sub)}
                              className="text-yellow-500 hover:text-yellow-600 transition"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="text-red-500 hover:text-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectManager;
