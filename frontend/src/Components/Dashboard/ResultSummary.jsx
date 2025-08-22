import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ResultSummary = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const student = JSON.parse(localStorage.getItem("studentData"));
        const studentId = student?._id;

        if (!token || !studentId) {
          setError("Student not authenticated.");
          return;
        }

        const res = await axios.get(`/api/results/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResults(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching results:", err);
        setError("Failed to fetch result summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const chartData = {
    labels: results.map((r) => `${r.term} ${r.year}`),
    datasets: [
      {
        label: "📈 Percentage (%)",
        data: results.map((r) => r.percentage),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.08)",
        tension: 0.4,
        pointBorderColor: "#8b5cf6",
        pointBackgroundColor: "#c4b5fd",
        pointRadius: 6,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4f46e5",
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `📊 ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { color: "#4b5563" },
        title: {
          display: true,
          text: "Percentage",
          color: "#6b7280",
          font: { size: 14, weight: "bold" },
        },
      },
      x: {
        ticks: { color: "#4b5563" },
        title: {
          display: true,
          text: "Term",
          color: "#6b7280",
          font: { size: 14, weight: "bold" },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl p-6 overflow-hidden"
    >
      {/* Decorative Glows */}
      <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            📊 Result Summary
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-44 text-indigo-500">
            <Loader className="animate-spin w-6 h-6 mb-2" />
            <span className="font-medium text-sm">Loading result summary...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No result data available.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="h-72 w-full"
          >
            <Line data={chartData} options={chartOptions} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultSummary;
