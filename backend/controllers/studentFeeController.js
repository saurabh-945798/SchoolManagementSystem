// controllers/studentFee.controller.js
import razorpay from "../config/razorpay.js";
import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import StudentFeePayment from "../models/StudentFeePayment.js";
import OfflineFee from "../models/OfflineFee.js";
import crypto from "crypto";

/* ----------------------------- Helper utils ----------------------------- */

const normalizeClassKey = (rawClass) => {
  if (!rawClass) return null;
  const level = String(rawClass).replace(/[^\d]/g, "");
  return level ? `Class ${level}` : null;
};

const inrNum = (n) => Number(n || 0);

/**
 * Pull all payments (online + offline) for a student
 * Returns: { onlinePayments[], offlinePayments[], onlinePaid, offlinePaid, totalPaid, monthsPaidSet }
 */
const fetchStudentPaymentsMerged = async (studentId) => {
  const [onlinePayments, offlinePayments] = await Promise.all([
    StudentFeePayment.find({ student: studentId, status: "success" }),
    OfflineFee.find({ student: studentId }),
  ]);

  const onlinePaid = onlinePayments.reduce((s, p) => s + inrNum(p.amountPaid), 0);
  const offlinePaid = offlinePayments.reduce((s, p) => s + inrNum(p.amount), 0);

  const monthsPaidSet = new Set([
    ...onlinePayments.flatMap((p) => p.monthsPaid || []),
    ...offlinePayments.flatMap((p) => p.months || []),
  ]);

  return {
    onlinePayments,
    offlinePayments,
    onlinePaid,
    offlinePaid,
    totalPaid: onlinePaid + offlinePaid,
    monthsPaidSet,
  };
};

/* ------------------------ 1️⃣ Get Fee Structure (merged) ------------------------ */
export const getStudentFeeStructure = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const rawClass = student.className || student.class;
    if (!rawClass) return res.status(400).json({ message: "Student class info missing" });

    const classKey = normalizeClassKey(rawClass);
    if (!classKey) return res.status(400).json({ message: "Invalid class format" });

    const fee = await Fee.findOne({ className: classKey });
    if (!fee) return res.status(404).json({ message: `Fee structure not found for ${classKey}` });

    // ✅ Merge online + offline
    const merged = await fetchStudentPaymentsMerged(student._id);
    const due = Math.max(inrNum(fee.amount) - inrNum(merged.totalPaid), 0);

    res.status(200).json({
      studentId: student._id,
      className: rawClass,
      classLevel: classKey.replace("Class ", ""),
      section: student.section,
      totalFee: inrNum(fee.amount),
      totalPaid: inrNum(merged.totalPaid),
      onlinePaid: inrNum(merged.onlinePaid),
      offlinePaid: inrNum(merged.offlinePaid),
      due,
      hasPaidFull: merged.totalPaid >= fee.amount,
      hasPaidHalf: merged.totalPaid >= fee.amount / 2 && merged.totalPaid < fee.amount,
      description: fee.description || "",
      monthsPaid: Array.from(merged.monthsPaidSet),
      monthlyFee: Math.round(inrNum(fee.amount) / 12),
    });
  } catch (err) {
    console.error("❌ getStudentFeeStructure error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------- 2️⃣ Create Razorpay Order -------------------------- */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount is required" });

    const options = {
      amount: Math.round(amount * 100), // to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (err) {
    console.error("❌ Razorpay order creation failed:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

/* --------------- 3️⃣ Record Online Fee Payment (with month guard) --------------- */
export const recordFeePayment = async (req, res) => {
  try {
    const {
      studentId,
      amountPaid,
      razorpayPaymentId,
      className,
      section,
      paymentType,          // "custom" or "full" etc.
      months = [],          // ["Jan", "Feb"]
      paymentMethod = "razorpay",
    } = req.body;

    if (!studentId || !amountPaid || !className || !section || !paymentType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const classKey = normalizeClassKey(className);
    if (!classKey) return res.status(400).json({ message: "Invalid class format" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const fee = await Fee.findOne({ className: classKey });
    if (!fee) return res.status(404).json({ message: `Fee structure not found for ${classKey}` });

    // ✅ Month duplication guard across BOTH online + offline
    if (months.length > 0) {
      const merged = await fetchStudentPaymentsMerged(studentId);
      const dupMonths = months.filter((m) => merged.monthsPaidSet.has(m));
      if (dupMonths.length) {
        return res
          .status(400)
          .json({ message: `These months are already paid: ${dupMonths.join(", ")}` });
      }
    }

    const paymentData = {
      student: studentId,
      className: classKey,
      section,
      amountPaid: inrNum(amountPaid),
      paymentType,
      monthsPaid: months,
      paymentMethod,
      status: "success",
    };

    if (paymentMethod === "razorpay") {
      paymentData.razorpayPaymentId = razorpayPaymentId;
    }

    const payment = new StudentFeePayment(paymentData);
    await payment.save();

    // ✅ Recompute merged totals after recording
    const merged = await fetchStudentPaymentsMerged(studentId);
    const due = Math.max(inrNum(fee.amount) - inrNum(merged.totalPaid), 0);

    res.status(201).json({
      message: "✅ Payment recorded successfully",
      payment,
      updatedFee: {
        totalFee: inrNum(fee.amount),
        totalPaid: inrNum(merged.totalPaid),
        onlinePaid: inrNum(merged.onlinePaid),
        offlinePaid: inrNum(merged.offlinePaid),
        due,
        hasPaidFull: merged.totalPaid >= fee.amount,
        hasPaidHalf: merged.totalPaid >= fee.amount / 2 && merged.totalPaid < fee.amount,
        monthsPaid: Array.from(merged.monthsPaidSet),
        monthlyFee: Math.round(inrNum(fee.amount) / 12),
      },
    });
  } catch (err) {
    console.error("❌ Payment recording error:", err);
    res.status(500).json({ message: "Server error recording payment" });
  }
};

/* ------------------- 4️⃣ Get Fee History (Online + Offline merged) ------------------- */
export const getFeeHistory = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const [online, offline] = await Promise.all([
      StudentFeePayment.find({ student: studentId }).sort({ paidAt: -1 }),
      OfflineFee.find({ student: studentId }).sort({ date: -1 }),
    ]);

    // Normalize & combine
    const rows = [
      ...online.map((p) => ({
        _id: p._id,
        amount: inrNum(p.amountPaid),
        type: "online",
        status: p.status,
        txnId: p.razorpayPaymentId || "-",
        date: p.paidAt || p.createdAt,
        months: p.monthsPaid || [],
        method: p.paymentMethod || "razorpay",
      })),
      ...offline.map((p) => ({
        _id: p._id,
        amount: inrNum(p.amount),
        type: "offline",
        status: "success",
        txnId: "-",
        date: p.date || p.createdAt,
        months: p.months || [],
        method: p.paymentMode || "Cash",
        receivedBy: p.receivedBy,
        cashier: p.cashier,
        remark: p.remark || "",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch fee history:", err);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};

/* ---------------- 5️⃣ Admin: Get All Student Payments (already merged) ---------------- */
export const getAllStudentPayments = async (req, res) => {
  try {
    // ✅ Fetch online payments with correct field names
    const onlinePayments = await StudentFeePayment.find()
      .sort({ paidAt: -1 })
      .populate("student", "name rollNumber class section");

    // ✅ Fetch offline payments with correct field names
    const offlinePayments = await OfflineFee.find()
      .sort({ date: -1 })
      .populate("student", "name rollNumber class section");

    const paymentsMap = {};

    // Merge online payments
    onlinePayments.forEach((p) => {
      const sid = p.student._id.toString();
      if (!paymentsMap[sid]) paymentsMap[sid] = { student: p.student, payments: [] };
      paymentsMap[sid].payments.push({
        _id: p._id,
        amountPaid: Number(p.amountPaid || 0),
        paymentType: "online",
        razorpayPaymentId: p.razorpayPaymentId || "-",
        status: p.status,
        paidAt: p.paidAt || p.createdAt,
        monthsPaid: p.monthsPaid || [],
      });
    });

    // Merge offline payments
    offlinePayments.forEach((p) => {
      const sid = p.student._id.toString();
      if (!paymentsMap[sid]) paymentsMap[sid] = { student: p.student, payments: [] };
      paymentsMap[sid].payments.push({
        _id: p._id,
        amountPaid: Number(p.amount || 0),
        paymentType: "offline",
        razorpayPaymentId: "-",
        status: "success",
        paidAt: p.date || p.createdAt,
        monthsPaid: p.months || [],
        cashier: p.cashier || "-",
        receivedBy: p.receivedBy || "-",
        paymentMode: p.paymentMode || "Cash",
        remark: p.remark || "",
      });
    });

    res.status(200).json(Object.values(paymentsMap));
  } catch (err) {
    console.error("❌ Failed to fetch all student payments:", err);
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};


/* --------------------------- 6️⃣ Verify Razorpay Payment --------------------------- */
export const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.status(200).json({ message: "✅ Payment verified successfully" });
  } else {
    return res.status(400).json({ message: "❌ Payment verification failed" });
  }
};

/* --------------------- 7️⃣ Admin: Fee Status Summary (merged) --------------------- */
export const getFeeStatusSummary = async (req, res) => {
  try {
    const students = await Student.find();
    const completed = [];
    const pending = [];

    for (const student of students) {
      try {
        const rawClass = student.className || student.class;
        if (!rawClass) continue;

        const classKey = normalizeClassKey(rawClass);
        if (!classKey) continue;

        const fee = await Fee.findOne({ className: classKey });
        if (!fee || !fee.amount) continue;

        // ✅ Online + Offline totals
        const { totalPaid } = await fetchStudentPaymentsMerged(student._id);

        const studentData = {
          _id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          className: rawClass,
          section: student.section,
          totalFee: inrNum(fee.amount),
          totalPaid: inrNum(totalPaid),
          due: Math.max(inrNum(fee.amount) - inrNum(totalPaid), 0),
        };

        if (totalPaid >= fee.amount) completed.push(studentData);
        else pending.push(studentData);
      } catch (innerErr) {
        console.error("⚠️ Error for student", student.name, "→", innerErr.message);
        continue;
      }
    }

    res.status(200).json({ completed, pending });
  } catch (err) {
    console.error("❌ Fee status summary error:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------- 8️⃣ Admin: Class-Wise Defaulters (merged totals) ---------------- */
export const getClassWiseDefaulters = async (req, res) => {
  try {
    const [students, fees, online, offline] = await Promise.all([
      Student.find(),
      Fee.find(),
      StudentFeePayment.find({ status: "success" }),
      OfflineFee.find(),
    ]);

    const feeMap = {};
    fees.forEach((f) => {
      feeMap[f.className] = inrNum(f.amount);
    });

    // Build totalPaid map including offline
    const paidMap = {};
    online.forEach((p) => {
      const sid = p.student?.toString();
      if (!sid) return;
      if (!paidMap[sid]) paidMap[sid] = 0;
      paidMap[sid] += inrNum(p.amountPaid);
    });
    offline.forEach((p) => {
      const sid = p.student?.toString();
      if (!sid) return;
      if (!paidMap[sid]) paidMap[sid] = 0;
      paidMap[sid] += inrNum(p.amount);
    });

    const defaultersByClass = {};

    for (const student of students) {
      const rawClass = student.className || student.class;
      if (!rawClass) continue;

      const classKey = normalizeClassKey(rawClass);
      const totalFee = feeMap[classKey] || 0;
      const sid = student._id.toString();
      const totalPaid = paidMap[sid] || 0;

      if (totalPaid < totalFee) {
        if (!defaultersByClass[classKey]) defaultersByClass[classKey] = [];
        defaultersByClass[classKey].push({
          _id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          className: rawClass,
          section: student.section,
          fatherName: student.fatherName || "N/A",
          fatherContact: student.fatherPhone || "N/A",
          totalFee,
          totalPaid,
          due: totalFee - totalPaid,
        });
      }
    }

    res.status(200).json({ defaulters: defaultersByClass });
  } catch (err) {
    console.error("❌ Error in getClassWiseDefaulters:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
