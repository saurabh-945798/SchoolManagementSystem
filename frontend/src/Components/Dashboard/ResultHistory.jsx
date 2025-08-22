import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResultHistory = () => {
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  const [editingResult, setEditingResult] = useState(null); // holds result being edited
  const [editSubjects, setEditSubjects] = useState([]);

  const token = localStorage.getItem('adminToken');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/results/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch result history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // 🔍 Search Handler
  useEffect(() => {
    const term = search.toLowerCase();
    const matched = results.filter(
      (res) =>
        res.studentName.toLowerCase().includes(term) ||
        res.studentRoll.toLowerCase().includes(term) ||
        res.className.toLowerCase().includes(term) ||
        res.term.toLowerCase().includes(term) ||
        res.year.toString().includes(term)
    );
    setFiltered(matched);
    setVisibleCount(10);
  }, [search, results]);

  const loadMore = () => setVisibleCount((prev) => prev + 10);

  // ❌ Delete Result
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Result deleted');
      fetchResults();
    } catch (err) {
      toast.error('Failed to delete result');
    }
  };

  // ✏️ Start Editing
  const handleEdit = (res) => {
    setEditingResult(res);
    setEditSubjects(res.subjects.map((s) => ({ ...s, marksObtained: s.marks })));
  };

  // ✅ Submit Edit
  const submitEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/results/${editingResult._id}`, {
        term: editingResult.term,
        year: editingResult.year,
        subjects: editSubjects,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Result updated');
      setEditingResult(null);
      fetchResults();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">📜 Result History</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Search by name, roll, class, term..."
        className="w-full border p-2 rounded shadow-sm mb-4"
      />

      {loading ? (
        <div className="text-center text-gray-600 py-8 animate-pulse">⏳ Loading results...</div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No result records found.</p>
      ) : (
        <>
          <div className="space-y-6">
            {filtered.slice(0, visibleCount).map((res, idx) => (
              <div key={res._id || idx} className="bg-white p-4 shadow rounded border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      👨‍🎓 {res.studentName} (Roll: {res.studentRoll})
                    </p>
                    <p className="text-sm text-gray-600">
                      Class: {res.className} | Term: {res.term} {res.year}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(res)}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Marks</th>
                        <th className="px-3 py-2">Out of</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.subjects.map((subj, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-3 py-1">{subj.name}</td>
                          <td className="px-3 py-1">{subj.marks}</td>
                          <td className="px-3 py-1">{subj.maxMarks}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="px-3 py-1">Total</td>
                        <td className="px-3 py-1">{res.total}</td>
                        <td className="px-3 py-1">
                          {res.subjects.reduce((acc, s) => acc + s.maxMarks, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                ⬇️ Load More Results
              </button>
            </div>
          )}
        </>
      )}

      {/* ✏️ Edit Modal */}
      {editingResult && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4 text-indigo-700">
              Edit Result - {editingResult.studentName}
            </h3>

            {editSubjects.map((subj, idx) => (
              <div key={idx} className="mb-3">
                <label className="block text-sm font-medium text-gray-700">{subj.name}</label>
                <input
                  type="number"
                  value={subj.marksObtained}
                  onChange={(e) =>
                    setEditSubjects((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, marksObtained: Number(e.target.value) } : s
                      )
                    )
                  }
                  className="w-full border px-3 py-1 rounded"
                />
              </div>
            ))}

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditingResult(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultHistory;
