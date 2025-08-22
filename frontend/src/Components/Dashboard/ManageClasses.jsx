import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [level, setLevel] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/classes');
      setClasses(res.data);
    } catch {
      toast.error('❌ Failed to load classes');
    }
  };

  const createClass = async () => {
    if (!level || !section) {
      toast.warning('⚠️ Both level and section are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/classes', {
        class: level,
        section,
      });
      toast.success('✅ Class created');
      setLevel('');
      setSection('');
      fetchClasses();
    } catch (err) {
      toast.error(`❌ ${err?.response?.data?.message || 'Failed to create class'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:ml-64 bg-gray-100 min-h-screen font-poppins">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">🏫 Manage Classes</h2>

        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            placeholder="Class Level (e.g., 8)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-1/2"
          />
          <input
            placeholder="Section (e.g., A)"
            value={section}
            onChange={(e) => setSection(e.target.value.toUpperCase())}
            className="border px-3 py-2 rounded w-full sm:w-1/2"
          />
          <button
            onClick={createClass}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding...' : '➕ Add'}
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">📋 All Classes</h3>
        <ul className="list-disc pl-5 space-y-1">
          {classes.map((cls) => (
            <li key={cls._id}>
              {cls.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageClasses;
