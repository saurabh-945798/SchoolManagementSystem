import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import OfflineFee from "../models/OfflineFee.js";
import StudentFeePayment from "../models/StudentFeePayment.js"; // online payments

// 🔹 Step 1: Fetch Student Details by Roll No & Class/Section
export const getStudentByRoll = async (req, res) => {
  try {
    const { rollNo, className, section } = req.query;

    if (!rollNo || !className || !section) {
      return res.status(400).json({ message: "rollNo, className, and section are required" });
    }

    const student = await Student.findOne({
      rollNumber: Number(rollNo),
      class: className,
      section: section.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// 🔹 Step 2: Get Fee Summary (online + offline)
export const getFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Class mapping (string form me store ho raha hai Fee collection me)
    const classMap = {
      "1": "Class 1", "2": "Class 2", "3": "Class 3", "4": "Class 4",
      "5": "Class 5", "6": "Class 6", "7": "Class 7", "8": "Class 8",
      "9": "Class 9", "10": "Class 10", "11": "Class 11", "12": "Class 12",
    };

    const feeStructure = await Fee.findOne({
      className: classMap[student.class],
    });

    const totalFee = feeStructure ? feeStructure.amount : 0;
    const monthlyFee = feeStructure ? Math.round(feeStructure.amount / 12) : 0;

    // ✅ Online payments
    const onlinePaymentsDocs = await StudentFeePayment.find({
      student: student._id,
      status: "success",
    });

    // ✅ Offline payments
    const offlinePayments = await OfflineFee.find({
      student: student._id,
    }).sort({ date: -1 });

    // ---- Collect paid months ----
    let paidMonths = new Set();

    // Offline -> "months"
    offlinePayments.forEach((p) => {
      (p.months || []).forEach((m) => paidMonths.add(m));
    });

    // Online -> "monthsPaid"
    onlinePaymentsDocs.forEach((p) => {
      (p.monthsPaid || []).forEach((m) => paidMonths.add(m));
    });

    // ---- Correct amount calculation ----
    const onlinePaid = onlinePaymentsDocs.reduce(
      (sum, p) => sum + (p.amountPaid || 0),
      0
    );
    const offlinePaid = offlinePayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const totalPaid = onlinePaid + offlinePaid;
    const remaining = Math.max(totalFee - totalPaid, 0);

    res.json({
      student,
      totalFee,
      monthlyFee,
      paidMonths: [...paidMonths], // ✅ yahi frontend me disable karega
      totalPaid,
      onlinePaid,
      offlinePaid,
      remaining,
      onlinePayments: onlinePaymentsDocs,
      offlinePayments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fee summary", error: error.message });
  }
};







// 🔹 Step 3: Add Offline Payment (with duplicate month check)
export const addOfflinePayment = async (req, res) => {
  try {
    const { studentId, months, paymentMode, remark, receivedBy, cashier } = req.body;

    if (!studentId || !months || months.length === 0 || !paymentMode || !receivedBy || !cashier) {
      return res.status(400).json({ message: "studentId, months, paymentMode, receivedBy, cashier are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 🔹 Already Paid Months (offline + online)
    const offlinePayments = await OfflineFee.find({ student: student._id });
    const onlinePayments = await StudentFeePayment.find({ student: student._id, status: "success" });

    let alreadyPaidMonths = new Set();

    offlinePayments.forEach(p => {
      if (p.months) p.months.forEach(m => alreadyPaidMonths.add(m));
    });

    onlinePayments.forEach(p => {
      if (p.months) p.months.forEach(m => alreadyPaidMonths.add(m));
    });

    // 🔹 Check if any of the requested months are already paid
    const duplicateMonths = months.filter(m => alreadyPaidMonths.has(m));
    if (duplicateMonths.length > 0) {
      return res.status(400).json({
        message: `Fee already submitted for months: ${duplicateMonths.join(", ")}`,
        duplicateMonths,
      });
    }

    // 🔹 Get fee structure for student’s class
    const classMap = {
      "1": "Class 1", "2": "Class 2", "3": "Class 3", "4": "Class 4",
      "5": "Class 5", "6": "Class 6", "7": "Class 7", "8": "Class 8",
      "9": "Class 9", "10": "Class 10", "11": "Class 11", "12": "Class 12",
    };

    const feeStructure = await Fee.findOne({ className: classMap[student.class] });
    if (!feeStructure) {
      return res.status(400).json({ message: "Fee structure not found for this class" });
    }

    const monthlyFee = Math.round(feeStructure.amount / 12);
    const totalAmount = monthlyFee * months.length;

    const payment = new OfflineFee({
      student: student._id,
      amount: totalAmount,
      months,
      paymentMode,
      remark,
      receivedBy,
      cashier,
      date: new Date(),
    });

    await payment.save();

    res.status(201).json({ message: "Offline payment added successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Error adding payment", error: error.message });
  }
};





export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student ki sari payment history nikal lo (online + offline)
    const payments = await StudentFeePayment.find({ student: studentId });

    // Agar payment history khali hai
    if (!payments.length) {
      return res.json({
        totalPaid: 0,
        payments: [],
      });
    }

    // Total paid nikalna
    const totalPaid = payments
      .filter((p) => p.status === "success") // sirf success wale
      .reduce((sum, p) => sum + p.amountPaid, 0);

    res.json({
      totalPaid,
      payments,
    });
  } catch (error) {
    console.error("Error fetching student fees:", error);
    res.status(500).json({ message: "Error fetching student fees" });
  }
};
