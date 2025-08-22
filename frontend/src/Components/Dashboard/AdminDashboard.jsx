// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import {
  UsersIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  UserMinusIcon,
  XCircleIcon,
  AcademicCapIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [sectionStrength, setSectionStrength] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/admin/dashboard-summary",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching dashboard:", err);
      }
    };
    fetchSummary();
  }, [token]);

  useEffect(() => {
    const fetchStrength = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/stats/section-strength/${selectedClass}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSectionStrength(res.data.sections || []);
      } catch (err) {
        console.error("❌ Error fetching section-wise strength:", err);
      }
    };
    fetchStrength();
  }, [selectedClass, token]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const revenuePercentage = data.totalExpectedFee
    ? Math.min(100, ((data.totalRevenue / data.totalExpectedFee) * 100).toFixed(1))
    : 0;

  // Chart data
  const attendanceBarChart = {
    labels: data.weeklyAttendance.map((day) => day.date.slice(5)),
    datasets: [
      {
        label: "Present",
        data: data.weeklyAttendance.map((day) => day.present ?? 0),
        backgroundColor: "#10B981",
        borderRadius: 6,
        barThickness: 22,
      },
      {
        label: "Absent",
        data: data.weeklyAttendance.map((day) => day.absent ?? 0),
        backgroundColor: "#EF4444",
        borderRadius: 6,
        barThickness: 22,
      },
    ],
  };

  const sectionBarChart = {
    labels: sectionStrength.map((s) => `${selectedClass}${s._id}`),
    datasets: [
      {
        label: `Class ${selectedClass}`,
        data: sectionStrength.map((s) => s.count),
        backgroundColor: "#3B82F6",
        borderRadius: 6,
        barThickness: 36,
      },
    ],
  };

  const genderPieChart = {
    labels: ["Boys", "Girls"],
    datasets: [
      {
        label: "Gender Ratio",
        data: [data.boys, data.girls],
        backgroundColor: ["#6366F1", "#EC4899"],
        borderColor: ["#C7D2FE", "#FBCFE8"],
        borderWidth: 2,
      },
    ],
  };

  const feeComparisonChart = {
    labels: ["Expected Fees", "Collected Revenue"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [data.totalExpectedFee, data.totalRevenue],
        backgroundColor: ["#F59E0B", "#10B981"],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const defaultBarOptions = {
    responsive: true,
    animation: { duration: 700, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#374151", font: { size: 12, weight: "600" } },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
      x: {
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
    },
  };

  const feeBarOptions = {
    ...defaultBarOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `₹${v}`,
          color: "#6B7280",
          font: { size: 12 },
        },
      },
      x: defaultBarOptions.scales.x,
    },
  };

  // Small KPI list for grid layout (keeps same data but nicer visuals)
  const kpis = [
    { label: "Total Students", value: data.totalStudents, Icon: UsersIcon },
    { label: "Total Teachers", value: data.totalTeachers, Icon: UserGroupIcon },
    { label: "Total Revenue (₹)", value: data.totalRevenue, Icon: CurrencyRupeeIcon },
    { label: "Fee Defaulters", value: data.feeDefaultersCount, Icon: UserMinusIcon },
    { label: "Present (Week)", value: data.presentCountWeekly, Icon: CheckCircleIcon },
    { label: "Absent (Week)", value: data.absentCountWeekly, Icon: XCircleIcon },
    { label: "Expected Fees (₹)", value: data.totalExpectedFee, Icon: AcademicCapIcon },
    { label: "Boys", value: data.boys, Icon: UserIcon },
    { label: "Girls", value: data.girls, Icon: UserIcon },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              📊 Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Overview of students, attendance, and fee collections.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border text-sm text-gray-700">
              Last updated: <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:scale-[1.02] transition">
              <span className="text-sm font-semibold">Export Report</span>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpis.map((k, idx) => (
            <div
              key={idx}
              className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 inline-flex">
                      <k.Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{k.label}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{k.value ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400">#</div>
              </div>
              {/* subtle footer */}
              <div className="absolute right-4 bottom-4 text-xs text-gray-400">Realtime</div>
            </div>
          ))}
        </div>

        {/* Top charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📆 Weekly Attendance</h3>
              <div className="text-sm text-gray-500">Last 7 days</div>
            </div>
            <div style={{ height: 260 }}>
              <Bar data={attendanceBarChart} options={defaultBarOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/50 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">💰 Revenue Progress</h3>
              <p className="text-sm text-gray-500 mt-1">Collected vs Expected</p>

              <div className="mt-5">
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-green-400 to-teal-400 transition-all"
                    style={{ width: `${revenuePercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-gray-600">₹ {data.totalRevenue ?? 0} collected</div>
                  <div className="text-sm font-semibold text-gray-800">{revenuePercentage}%</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Expected: ₹ {data.totalExpectedFee ?? 0}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500">Quick Insights</div>
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                <li>• Defaulters: <span className="font-medium text-red-600">{data.feeDefaultersCount}</span></li>
                <li>• Online collections: <span className="font-medium text-green-600">₹ {data.onlineCollections ?? 0}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🏫 Section Strength (Class {selectedClass})</h3>
              <select
                className="text-sm border rounded px-2 py-1"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ height: 300 }}>
              <Bar data={sectionBarChart} options={defaultBarOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🧑‍🤝‍🧑 Gender Distribution</h3>
              <div className="text-sm text-gray-500">Total: {data.boys + data.girls}</div>
            </div>
            <div style={{ height: 280 }}>
              <Pie data={genderPieChart} />
            </div>
          </div>
        </div>

        {/* Fee comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">💹 Fees Comparison</h3>
            <div className="text-sm text-gray-500">Expected vs Collected</div>
          </div>
          <div style={{ height: 300 }}>
            <Bar data={feeComparisonChart} options={feeBarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
