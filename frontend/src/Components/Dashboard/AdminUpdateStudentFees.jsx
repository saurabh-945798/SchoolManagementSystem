import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate

const monthsList = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const AdminOfflineFees = () => {
  const [rollNo, setRollNo] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [student, setStudent] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [remark, setRemark] = useState("");
  const [cashier, setCashier] = useState("");
  const [lastPayment, setLastPayment] = useState(null);

  const navigate = useNavigate(); // <-- navigate instance

  const token = localStorage.getItem("adminToken");

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/offline-fees",
    headers: { Authorization: `Bearer ${token}` },
  });

  const handleSearchStudent = async () => {
    if (!rollNo || !className || !section) {
      toast.error("Please fill Roll No, Class and Section");
      return;
    }
    try {
      const res = await axiosInstance.get(
        `/student?rollNo=${rollNo}&className=${className}&section=${section}`
      );
      setStudent(res.data);

      const summaryRes = await axiosInstance.get(`/summary/${res.data._id}`);
      setFeeSummary(summaryRes.data);
      setSelectedMonths([]);
      setLastPayment(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error fetching student");
      setStudent(null);
      setFeeSummary(null);
    }
  };

  const toggleMonth = (month) => {
    if (feeSummary?.paidMonths?.includes(month)) {
      toast.error(`Fee already paid for ${month}`);
      return;
    }
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const calculateAmount = () => {
    if (!feeSummary?.monthlyFee) return 0;
    return feeSummary.monthlyFee * selectedMonths.length;
  };

  const handleAddPayment = async () => {
    if (selectedMonths.length === 0) {
      toast.error("Please select months");
      return;
    }
    if (!cashier) {
      toast.error("Please enter cashier name");
      return;
    }

    try {
      const res = await axiosInstance.post("/add", {
        studentId: student._id,
        months: selectedMonths,
        paymentMode,
        remark,
        receivedBy: "Admin",
        cashier,
      });

      toast.success(res.data.message);

      setLastPayment({
        months: selectedMonths,
        amount: calculateAmount(),
        paymentMode,
        cashier,
        date: new Date()
      });

      setRemark("");
      setCashier("");
      setSelectedMonths([]);

      const summaryRes = await axiosInstance.get(`/summary/${student._id}`);
      setFeeSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding payment");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-extrabold text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
      >
        💰 Offline Fee Collection
      </motion.h1>

      {/* Search Student */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-4">🔍 Search Student</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="number"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 flex-1 transition"
          />
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 flex-1 transition"
          />
          <input
            type="text"
            placeholder="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-28 transition"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchStudent}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Search
          </motion.button>
        </div>
      </motion.div>

      {/* Student Details & Fee Summary */}
      {student && feeSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-xl p-6 border-l-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-4">👨‍🎓 Student Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Roll No:</strong> {student.rollNumber}</p>
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Section:</strong> {student.section}</p>
          <p><strong>Father:</strong> {student.fatherName}</p>
          <p><strong>Father Phone:</strong> {student.fatherPhone}</p>
          <p><strong>Mother:</strong> {student.motherName}</p>
          <p><strong>Mother Phone:</strong> {student.motherPhone}</p>

          </div>
          <h3 className="text-lg font-semibold mb-2">📊 Fee Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <p><strong>Total Fee:</strong> ₹{feeSummary.totalFee}</p>
            <p><strong>Total Paid:</strong> ₹{feeSummary.totalPaid}</p>
            <p><strong>Online Paid:</strong> ₹{feeSummary.onlinePaid}</p>
            <p><strong>Offline Paid:</strong> ₹{feeSummary.offlinePaid}</p>
            <p className="col-span-2"><strong>Remaining:</strong> <span className="text-red-600 font-bold">₹{feeSummary.remaining}</span></p>
          </div>
        </motion.div>
      )}

      {/* Add Offline Payment */}
      {student && feeSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-green-100 shadow-xl p-6 rounded-xl border-l-4 border-green-500"
        >
          <h2 className="text-xl font-semibold mb-4">➕ Add Offline Payment</h2>

          {/* Months Selection */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-4">
            {monthsList.map((month) => {
              const isPaid = feeSummary.paidMonths?.includes(month);
              return (
                <label
                  key={month}
                  className={`flex items-center gap-2 p-1 rounded-lg transition justify-center border ${isPaid ? "text-gray-400 line-through cursor-not-allowed" : "hover:bg-green-200 cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMonths.includes(month)}
                    onChange={() => toggleMonth(month)}
                    disabled={isPaid}
                  />
                  {month}
                </label>
              );
            })}
          </div>

          <p className="mb-4 font-semibold text-lg">Amount: <span className="text-xl font-bold">₹{calculateAmount()}</span></p>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 transition"
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Cashier Name"
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 flex-1 transition"
            />

            <input
              type="text"
              placeholder="Remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 flex-1 transition"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddPayment}
              className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 transition"
            >
              Submit Payment
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Offline Payment History */}
      {feeSummary?.offlinePayments?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl p-6 rounded-xl overflow-x-auto"
        >
          <h2 className="text-xl font-semibold mb-4">📜 Offline Payment History</h2>
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Months</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Mode</th>
                <th className="border px-3 py-2">Cashier</th>
                <th className="border px-3 py-2">Received By</th>
                <th className="border px-3 py-2">Remark</th>
                <th className="border px-3 py-2">Print</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {feeSummary.offlinePayments.map((p) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01, backgroundColor: "#f0f9ff" }}
                    className="border-b"
                  >
                    <td className="border px-3 py-1">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="border px-3 py-1">{p.months?.join(", ")}</td>
                    <td className="border px-3 py-1">₹{p.amount}</td>
                    <td className="border px-3 py-1">{p.paymentMode}</td>
                    <td className="border px-3 py-1">{p.cashier}</td>
                    <td className="border px-3 py-1">{p.receivedBy}</td>
                    <td className="border px-3 py-1">{p.remark}</td>
                    <td className="border px-3 py-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate("/admin-offline-fee-receipt", { state: { payment: p, student, feeSummary } })}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Print
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOfflineFees;
