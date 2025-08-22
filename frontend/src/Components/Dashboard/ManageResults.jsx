import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Upload, Search, FileText, Percent, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Modern ManageResults (single-file)
 * - Glassmorphism containers
 * - Animated header & rows (Framer Motion)
 * - Sticky table header
 * - Per-student total / percentage preview
 * - Bulk apply inputs with validation
 * - Responsive layout
 *
 * Assumptions: keeps the same API endpoints & tokens as your original code.
 */

const COLORS = [
  'from-indigo-400 to-indigo-300',
  'from-emerald-400 to-emerald-300',
  'from-rose-400 to-rose-300',
  'from-yellow-400 to-yellow-300',
  'from-sky-400 to-sky-300',
];

const ManageResults = () => {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [outOf, setOutOf] = useState(100);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [bulkMarks, setBulkMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const token = localStorage.getItem('adminToken');

  const fetchStudentsAndSubjects = useCallback(async () => {
    if (!className) {
      toast.warn('📌 Please select a class');
      return;
    }

    setLoading(true);
    const classSection = section ? `${className}${section}` : className;

    try {
      const [studentRes, subjectRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/results/students/${classSection}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/subjects/${className}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const stuData = studentRes.data || [];
      const subjData = subjectRes.data || [];

      setStudents(stuData);
      setSubjects(subjData);

      // initialize marks structure
      const initial = {};
      stuData.forEach((s) => {
        initial[s._id] = {};
        subjData.forEach((subj) => {
          initial[s._id][subj.name] = '';
        });
      });
      setMarks(initial);
      setBulkMarks({});
      toast.success('✅ Students & subjects loaded');
    } catch (err) {
      console.error('Fetch error', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [className, section, token, refreshKey]);

  useEffect(() => {
    if (className) fetchStudentsAndSubjects();
  }, [className, fetchStudentsAndSubjects]);

  // computed stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalSubjects = subjects.length;
    return { totalStudents, totalSubjects };
  }, [students, subjects]);

  const handleMarksChange = (studentId, subject, value) => {
    // keep only numeric and empty
    if (value !== '' && isNaN(value)) return;
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: value === '' ? '' : String(Number(value)),
      },
    }));
  };

  const handleBulkChange = (subjectName, value) => {
    if (value !== '' && isNaN(value)) return;
    setBulkMarks((prev) => ({ ...prev, [subjectName]: value === '' ? '' : String(Number(value)) }));
  };

  const handleApplyToAll = (subjectName) => {
    const value = bulkMarks[subjectName];
    if (value === '' || isNaN(value)) {
      toast.warn('❗ Enter valid marks before applying');
      return;
    }
    const updated = { ...marks };
    students.forEach((stu) => {
      if (!updated[stu._id]) updated[stu._id] = {};
      updated[stu._id][subjectName] = String(Number(value));
    });
    setMarks(updated);
    toast.success(`✅ Applied ${value} to all for ${subjectName}`);
  };

  const handleSubmit = async () => {
    if (students.length === 0 || subjects.length === 0) {
      toast.warn('⚠️ No students or subjects to submit');
      return;
    }

    // Basic validation: ensure marks are numeric within 0..outOf
    for (const s of students) {
      for (const subj of subjects) {
        const val = marks[s._id]?.[subj.name];
        if (val === '' || val == null) continue; // allow empty (interpreted as 0)
        const n = Number(val);
        if (isNaN(n) || n < 0 || n > Number(outOf)) {
          toast.error(`❌ Invalid mark for ${s.name} - ${subj.name}. Must be 0 to ${outOf}`);
          return;
        }
      }
    }

    const tokenLocal = token;
    const resultPayload = students.map((stu) => ({
      studentId: stu._id,
      studentRoll: stu.rollNumber,
      studentName: stu.name,
      className,
      term,
      year,
      subjects: subjects.map((subj) => ({
        name: subj.name,
        marksObtained: Number(marks[stu._id]?.[subj.name] || 0),
        outOf: Number(outOf),
      })),
    }));

    try {
      setSubmitting(true);
      await axios.post(
        'http://localhost:5000/api/results/bulk',
        { results: resultPayload },
        { headers: { Authorization: `Bearer ${tokenLocal}` } }
      );
      toast.success('🎉 Results submitted successfully!');
    } catch (err) {
      console.error('Submission error', err);
      toast.error(err?.response?.data?.message || 'Failed to submit results');
    } finally {
      setSubmitting(false);
    }
  };

  const computeStudentTotal = (studentId) => {
    if (!marks[studentId]) return 0;
    return subjects.reduce((acc, subj) => acc + Number(marks[studentId][subj.name] || 0), 0);
  };

  const computePercentage = (studentId) => {
    const total = computeStudentTotal(studentId);
    const maxTotal = subjects.length * Number(outOf || 100);
    return maxTotal === 0 ? 0 : ((total / maxTotal) * 100).toFixed(2);
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  // small helper UI components
  const SubjectHeader = ({ subj, idx }) => {
    const gradient = COLORS[idx % COLORS.length];
    return (
      <th className="border px-3 py-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-sm`}
            title={subj.name}
          >
            {subj.name}
          </div>
          <div className="text-xs text-gray-600">{`(${outOf})`}</div>
          <div className="mt-1 flex items-center gap-1">
            <input
              type="number"
              value={bulkMarks[subj.name] || ''}
              onChange={(e) => handleBulkChange(subj.name, e.target.value)}
              className="w-16 text-center border rounded px-1 py-0.5 focus:ring-2 focus:ring-blue-300"
              placeholder="All"
            />
            <button
              onClick={() => handleApplyToAll(subj.name)}
              title={`Apply ${bulkMarks[subj.name] || ''} to all`}
              className="text-xs text-blue-600 hover:underline"
            >
              Apply
            </button>
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-white">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-700 flex items-center gap-3">
              <FileText className="w-6 h-6 text-sky-500" />
              Upload Student Results
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Fast, accurate bulk upload. Validate marks (0 — {outOf}) and submit results for the selected
              class/term.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 text-right">
              <div className="font-medium text-slate-800">{stats.totalStudents} students</div>
              <div className="text-xs">• {stats.totalSubjects} subjects</div>
            </div>

            <button
              onClick={refresh}
              className="flex items-center gap-2 bg-white border px-3 py-2 rounded-lg shadow-sm hover:shadow-md"
              title="Refresh data"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left controls */}
        <section className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-lg">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600">Class</label>
              <select
                className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-sky-300"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="">Select class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Section</label>
              <select
                className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-sky-300"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="">All Sections</option>
                {['A', 'B', 'C'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Term</label>
              <select
                className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-sky-300"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                {['Term 1', 'Term 2', 'Final'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600">Out of (per subject)</label>
              <input
                type="number"
                value={outOf}
                onChange={(e) => setOutOf(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={fetchStudentsAndSubjects}
                disabled={!className || loading}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                title="Fetch students & subjects"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Fetch
              </button>

              <button
                onClick={() => {
                  setStudents([]);
                  setSubjects([]);
                  setMarks({});
                  setBulkMarks({});
                }}
                className="bg-white border px-4 py-2 rounded-lg"
                title="Clear loaded data"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Tip: Use the small input under each subject to apply the same mark to everyone quickly.
            </div>
          </div>
        </section>

        {/* Right primary area */}
        <section className="lg:col-span-3">
          <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-lg overflow-hidden">
            {/* Table */}
            <div className="overflow-auto rounded-lg">
              {students.length > 0 && subjects.length > 0 ? (
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-sky-50 sticky top-0 z-20">
                    <tr>
                      <th className="border px-3 py-2 text-left">Roll</th>
                      <th className="border px-3 py-2 text-left">Name</th>
                      {subjects.map((s, i) => (
                        <SubjectHeader key={s.name} subj={s} idx={i} />
                      ))}
                      <th className="border px-3 py-2 text-center">Total</th>
                      <th className="border px-3 py-2 text-center">%</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((stu, idx) => (
                      <motion.tr
                        key={stu._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-sky-50"
                      >
                        <td className="border px-3 py-2 text-sm">{stu.rollNumber}</td>
                        <td className="border px-3 py-2">{stu.name}</td>

                        {subjects.map((subj) => (
                          <td key={subj.name} className="border px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={Number(outOf)}
                              value={marks[stu._id]?.[subj.name] ?? ''}
                              onChange={(e) => handleMarksChange(stu._id, subj.name, e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-emerald-300"
                            />
                          </td>
                        ))}

                        <td className="border px-3 py-2 text-center font-semibold">
                          {computeStudentTotal(stu._id)}
                        </td>
                        <td
                          className={`border px-3 py-2 text-center ${
                            Number(computePercentage(stu._id)) >= 75 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {computePercentage(stu._id)}%
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading data...
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg mb-2">No data loaded</div>
                      <div>Select class & hit <strong>Fetch</strong> to load students and subjects.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* actions */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Percent className="w-4 h-4" />
                <div>
                  <div className="font-medium">{students.length} students</div>
                  <div className="text-xs">Max per subject: {outOf}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || students.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Submit All Results
                </button>

                <button
                  onClick={() => {
                    // quick export preview CSV (client-side)
                    if (students.length === 0 || subjects.length === 0) {
                      toast.info('No data to export');
                      return;
                    }
                    const rows = [];
                    const header = ['Roll', 'Name', ...subjects.map((s) => s.name), 'Total', 'Percentage'];
                    rows.push(header.join(','));
                    students.forEach((stu) => {
                      const row = [
                        `"${stu.rollNumber}"`,
                        `"${stu.name.replace(/"/g, '""')}"`,
                        ...subjects.map((subj) => marks[stu._id]?.[subj.name] || 0),
                        computeStudentTotal(stu._id),
                        computePercentage(stu._id),
                      ];
                      rows.push(row.join(','));
                    });
                    const csv = rows.join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${className || 'class'}_${section || 'all'}_${term}_${year}_results.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('CSV exported');
                  }}
                  className="bg-white border px-3 py-2 rounded-lg"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ManageResults;
