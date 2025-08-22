import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CalendarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const monthsList = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const pulseOnce = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.015, 1], transition: { duration: 0.6 } },
};

const INR = (n) =>
  (n ?? 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const StudentFees = () => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("studentToken");
  const student = JSON.parse(localStorage.getItem("studentData") || "{}");

  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: backendURL,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  const fetchFeeStructure = async () => {
    try {
      setInitLoading(true);
      const res = await axiosInstance.get(`/api/student-fees/structure/${student._id}`);
      // Expected fields: totalFee, totalPaid, monthsPaid[], className, section
      setFeeDetails(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching fee structure:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to load fee details.");
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalFee = feeDetails?.totalFee || 0;
  const totalPaid = feeDetails?.totalPaid || 0; // ✅ backend-computed (online + offline). Do NOT add offline again
  const due = Math.max(totalFee - totalPaid, 0);
  const monthlyFee = Math.round(totalFee / 12);
  const allPaidMonths = new Set(feeDetails?.monthsPaid || []);
  const payableMonths = selectedMonths.filter((m) => !allPaidMonths.has(m));
  const amountToPay = monthlyFee * payableMonths.length;

  const toggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const statusBadge = () => {
    if (totalPaid >= totalFee)
      return (
        <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-sm font-semibold">
          <CheckCircleIcon className="w-5 h-5" />
          Fully Paid
        </span>
      );
    if (totalPaid > 0)
      return (
        <span className="inline-flex items-center gap-2 text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full text-sm font-semibold">
          <ClockIcon className="w-5 h-5" />
          Partially Paid
        </span>
      );
    return (
      <span className="inline-flex items-center gap-2 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-sm font-semibold">
        <ExclamationCircleIcon className="w-5 h-5" />
        Not Paid
      </span>
    );
  };

  const handlePayment = async () => {
    if (!payableMonths.length) {
      alert("Please select at least one unpaid month!");
      return;
    }

    try {
      setLoading(true);

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Razorpay SDK failed to load. Please check your network.");
        return;
      }

      // Create order for exact amount (in rupees)
      const { data } = await axiosInstance.post("/api/student-fees/create-order", {
        amount: amountToPay,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "St. Paul's School Fee Payment",
        description: `Fee Payment for ${payableMonths.join(", ")}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Verify signature
            const verify = await axiosInstance.post("/api/student-fees/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verify.status === 200) {
              // Record payment months + details
              await axiosInstance.post("/api/student-fees/record-payment", {
                studentId: student._id,
                amountPaid: amountToPay,
                razorpayPaymentId: response.razorpay_payment_id,
                className: feeDetails.className,
                section: feeDetails.section,
                paymentType: "custom",
                months: payableMonths, // save only payable subset
              });

              setSelectedMonths([]);
              await fetchFeeStructure();
              alert("✅ Payment Successful!");
            } else {
              alert("❌ Payment Verification Failed");
            }
          } catch (err) {
            console.error("Payment handler error:", err);
            alert("❌ Something went wrong!");
          }
        },
        prefill: {
          name: student?.name || "",
          email: student?.email || "",
        },
        theme: { color: "#4F46E5" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("Payment error:", err?.response?.data || err.message);
      alert("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!feeDetails) return null;

  const progress = totalFee ? Math.min(100, Math.round((totalPaid / totalFee) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-20 px-4 sm:px-6 font-inter">
      <motion.div
        className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 rounded-3xl p-[1px] shadow-[0_10px_30px_rgba(79,70,229,0.25)]"
        {...pulseOnce}
      >
        <div className="bg-white rounded-3xl p-6 sm:p-10">
          <motion.h2
            className="text-3xl font-extrabold text-indigo-700 mb-6 text-center tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            💰 Fee Payment Portal
          </motion.h2>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div
              className="rounded-2xl border bg-white p-4"
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <div className="flex items-center gap-3 mb-2">
                <BanknotesIcon className="w-6 h-6 text-indigo-600" />
                <div className="text-sm text-gray-500">Total Fee</div>
              </div>
              <div className="text-xl font-semibold">{INR(totalFee)}</div>
            </motion.div>

            <motion.div
              className="rounded-2xl border bg-white p-4"
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <div className="flex items-center gap-3 mb-2">
                <CreditCardIcon className="w-6 h-6 text-indigo-600" />
                <div className="text-sm text-gray-500">Paid</div>
              </div>
              <div className="text-xl font-semibold">{INR(totalPaid)}</div>
            </motion.div>

            <motion.div
              className="rounded-2xl border bg-white p-4"
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <div className="flex items-center gap-3 mb-2">
                <ExclamationCircleIcon className="w-6 h-6 text-indigo-600" />
                <div className="text-sm text-gray-500">Due</div>
              </div>
              <div className="text-xl font-semibold">{INR(due)}</div>
            </motion.div>
          </div>

          {/* Progress */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Progress</span>
              <span className="text-sm font-semibold text-indigo-700">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-3 bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3">{statusBadge()}</div>
          </motion.div>

          {/* Class/Section */}
          <motion.div
            className="grid gap-4 sm:grid-cols-2 text-gray-700 mt-6"
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <p>
              <span className="font-semibold">📘 Class:</span> {feeDetails.className}
            </p>
            <p>
              <span className="font-semibold">🏷️ Section:</span> {feeDetails.section}
            </p>
          </motion.div>

          {/* Month-wise selection */}
          <motion.div
            className="mt-8"
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <label className="block mb-3 font-semibold text-gray-800">
              <span className="inline-flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Select Months to Pay
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {monthsList.map((month) => {
                const paid = allPaidMonths.has(month);
                const selected = selectedMonths.includes(month);
                return (
                  <motion.label
                    key={month}
                    className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer transition
                      ${paid ? "bg-green-50 border-green-300 text-green-800 cursor-not-allowed"
                             : selected ? "bg-indigo-50 border-indigo-300"
                                        : "hover:bg-indigo-50 border-gray-200"}
                    `}
                    whileHover={!paid ? { scale: 1.015 } : {}}
                    whileTap={!paid ? { scale: 0.985 } : {}}
                  >
                    <input
                      type="checkbox"
                      disabled={paid}
                      checked={paid || selected}
                      onChange={() => toggleMonth(month)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    {month}
                  </motion.label>
                );
              })}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {payableMonths.length > 0 && (
                <motion.div
                  key="amount-bar"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-center justify-between rounded-2xl border p-3 bg-gray-50"
                >
                  <div className="text-sm text-gray-700">
                    Selected:{" "}
                    <span className="font-medium">
                      {payableMonths.join(", ")}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-700">
                    Amount: {INR(amountToPay)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pay Button */}
          <motion.div
            className="mt-8"
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <button
              onClick={handlePayment}
              disabled={
                loading || payableMonths.length === 0 || totalPaid >= totalFee
              }
              className={`w-full py-3.5 rounded-2xl text-white font-semibold text-lg transition
                ${
                  totalPaid >= totalFee
                    ? "bg-green-500 cursor-not-allowed"
                    : payableMonths.length === 0 || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_rgba(79,70,229,0.35)]"
                }`}
            >
              {totalPaid >= totalFee
                ? "✅ Fee Already Paid"
                : loading
                ? "Processing..."
                : `Pay ${INR(amountToPay)} for ${payableMonths.length} Month${payableMonths.length > 1 ? "s" : ""}`}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Monthly Fee: <span className="font-medium">{INR(monthlyFee)}</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentFees;
