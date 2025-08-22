import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";

const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#7c3aed", "#fb923c"];

const smallCard = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  const student = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studentData"));
    } catch {
      return null;
    }
  }, []);

  const token = localStorage.getItem("studentToken");

  useEffect(() => {
    const fetchResults = async () => {
      if (!student?._id || !token) {
        setError("Unauthorized. Please login again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`/api/results/student/${student._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // expecting array of results sorted latest first (if backend not sorted, sort here)
        const sorted = Array.isArray(res.data)
          ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setResults(sorted);
      } catch (err) {
        console.error("❌ Result Fetch Error:", err);
        setError(err.response?.data?.message || "Error fetching results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [student, token]);

  const makeChartData = (subjects) =>
    subjects.map((s) => ({ name: s.name, Marks: s.marks, Max: s.maxMarks }));

  const bestSubject = (subjects) =>
    subjects.reduce(
      (best, s) => (s.marks / s.maxMarks > best.ratio ? { ...s, ratio: s.marks / s.maxMarks } : best),
      { ratio: -1 }
    );

  const weakestSubject = (subjects) =>
    subjects.reduce(
      (weak, s) => (s.marks / s.maxMarks < weak.ratio ? { ...s, ratio: s.marks / s.maxMarks } : weak),
      { ratio: 2 }
    );

  const overallTrend = useMemo(() => {
    // return array of { term, year, percentage } oldest -> newest
    return results
      .slice()
      .reverse()
      .map((r) => ({ label: `${r.term} ${r.year}`, percentage: Number(r.percentage) || 0 }));
  }, [results]);

  const toggleExpand = (i) => setExpandedIdx((prev) => (prev === i ? null : i));

  const handlePrint = (result) => {
    // simple approach: make a new window with printable content (basic)
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      alert("Popup blocked — allow popups for printing.");
      return;
    }
    const subjectRows = result.subjects
      .map(
        (s) =>
          `<tr style="border-bottom:1px solid #eee;"><td style="padding:8px">${s.name}</td><td style="padding:8px;text-align:center">${s.marks}</td><td style="padding:8px;text-align:center">${s.maxMarks}</td></tr>`
      )
      .join("");
    popup.document.write(`
      <html>
        <head>
          <title>Result - ${result.term} ${result.year}</title>
        </head>
        <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:24px;">
          <h1 style="color:#0f172a">Result — ${result.term} ${result.year}</h1>
          <p style="color:#334155">Student: ${student?.name || "—"} | Class: ${result.className || "—"}</p>
          <h3 style="margin-top:16px;color:#0f172a">Subjects</h3>
          <table style="width:100%;border-collapse:collapse;margin-top:8px">
            <thead>
              <tr style="background:#f8fafc;color:#0f172a"><th style="text-align:left;padding:8px">Subject</th><th style="padding:8px;text-align:center">Marks</th><th style="padding:8px;text-align:center">Max</th></tr>
            </thead>
            <tbody>
              ${subjectRows}
            </tbody>
          </table>
          <div style="margin-top:18px">
            <strong>Overall:</strong> ${result.total} / ${result.subjects.reduce((a,b)=>a+b.maxMarks,0)} — ${result.percentage}% (${result.grade})
          </div>
          <div style="margin-top:8px;color:#374151">${result.remark ? `<strong>Teacher Remark:</strong> ${result.remark}` : ""}</div>
          <div style="margin-top:18px"><button onclick="window.print()" style="padding:10px 16px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer">Print</button></div>
        </body>
      </html>
    `);
    popup.document.close();
  };

  if (loading)
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-center text-gray-600 py-10">Loading results...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-center text-red-500 text-lg py-6">{error}</p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl shadow">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Your Academic Results</h1>
            <p className="text-sm text-slate-500">Performance snapshots, subject insights & trends</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            title="Open trend in new tab"
            onClick={() => window.open("/student/results/trend", "_blank")}
            className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-700" />
            <span className="text-sm text-slate-700">Open Trends</span>
          </button> */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg shadow hover:bg-slate-800 transition"
            title="Print page"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="text-sm">Print / Save</span>
          </button>
        </div>
      </div>

      {/* overall mini trend sparkline */}
      {overallTrend.length > 1 && (
        <motion.div {...smallCard} className="mb-6 bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Performance Trend</p>
              <h3 className="text-lg font-semibold text-slate-900">Across recent terms</h3>
            </div>
            <div className="w-full md:w-2/3 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results list */}
      <div className="space-y-5">
        {results.map((result, idx) => {
          const subjects = result.subjects || [];
          const best = bestSubject(subjects);
          const weak = weakestSubject(subjects);
          const chartData = makeChartData(subjects);

          const passThreshold = result.passThreshold ?? 33; // fallback
          const passed = Number(result.percentage) >= passThreshold;

          const open = expandedIdx === idx;

          return (
            <motion.div
              key={result._id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl shadow-lg border p-4 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg px-3 py-2 bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                    <div className="text-sm text-slate-500">Term</div>
                    <div className="text-lg font-bold text-slate-900">{result.term} {result.year}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-md text-sm font-semibold ${passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {passed ? "✅ Passed" : "⚠ Needs Attention"}
                      </div>
                      <div className="text-sm text-slate-600">Grade: <span className="font-medium text-slate-800 ml-1">{result.grade}</span></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{result.className || ""}</p>
                    <div className="mt-2">
                      <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{result.percentage}%</div>
                      <div className="text-sm text-slate-500">Total: {result.total} / {subjects.reduce((a,b)=>a + (b.maxMarks || 0), 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePrint(result)}
                    className="bg-white border text-slate-700 px-3 py-2 rounded-lg hover:shadow transition"
                    title="Print this result"
                  >
                    Print
                  </button>

                  <button
                    onClick={() => toggleExpand(idx)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {open ? "Collapse" : "View Details"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mt-4 border-t pt-4"
                  >
                    {/* quick insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-indigo-50 p-3 rounded-lg border">
                        <div className="text-xs text-slate-500">Best Subject</div>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{best?.name || "—"}</div>
                        {best?.marks !== undefined && (
                          <div className="text-xs text-slate-600 mt-1">{best.marks} / {best.maxMarks} ({Math.round((best.marks/best.maxMarks)*100)}%)</div>
                        )}
                      </div>

                      <div className="bg-amber-50 p-3 rounded-lg border">
                        <div className="text-xs text-slate-500">Weakest Subject</div>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{weak?.name || "—"}</div>
                        {weak?.marks !== undefined && (
                          <div className="text-xs text-slate-600 mt-1">{weak.marks} / {weak.maxMarks} ({Math.round((weak.marks/weak.maxMarks)*100)}%)</div>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-slate-500">Teacher Remark</div>
                        <div className="text-sm text-slate-800 mt-1 italic">{result.remark || "No remark provided."}</div>
                      </div>
                    </div>

                    {/* subject list with progress bars */}
                    <div className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subjects.map((s, i) => {
                          const pct = Math.round(((s.marks || 0) / (s.maxMarks || 1)) * 100);
                          const color = pct >= 75 ? "bg-green-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
                          return (
                            <motion.div key={i} {...smallCard} className="bg-white rounded-lg p-3 border flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <div className="text-sm font-medium text-slate-800">{s.name}</div>
                                <div className="text-sm text-slate-600">{s.marks} / {s.maxMarks}</div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div style={{ width: `${pct}%` }} className={`h-3 ${color} transition-all`} />
                              </div>
                              <div className="text-xs text-slate-500">{pct}%</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="col-span-2 bg-slate-50 rounded-lg p-3 border">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Marks Comparison</div>
                        <div style={{ width: "100%", height: 240 }}>
                          <ResponsiveContainer>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Marks" fill="#3b82f6" radius={[6,6,0,0]} />
                              <Bar dataKey="Max" fill="#cbd5e1" radius={[6,6,0,0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Subject Share</div>
                        <div style={{ width: "100%", height: 240 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={chartData}
                                dataKey="Marks"
                                nameKey="name"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={3}
                              >
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentResults;
