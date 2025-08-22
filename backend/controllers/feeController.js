import Fee from "../models/Fee.js";

// ➕ Create Fee
export const createFee = async (req, res) => {
  try {
    const { className, amount, description } = req.body;

    const existing = await Fee.findOne({ className });
    if (existing) {
      return res.status(400).json({ message: "Fee already exists for this class" });
    }

    const fee = new Fee({ className, amount, description });
    await fee.save();

    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: "Error creating fee", error: err.message });
  }
};

// 📄 Get All Fees
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().sort({ className: 1 });
    res.status(200).json(fees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fees", error: err.message });
  }
};

// 📄 Get Fee by ID
export const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.status(200).json(fee);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fee", error: err.message });
  }
};

// ✏️ Update Fee
export const updateFee = async (req, res) => {
  try {
    const { className, amount, description } = req.body;

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { className, amount, description },
      { new: true }
    );

    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.status(200).json(fee);
  } catch (err) {
    res.status(500).json({ message: "Error updating fee", error: err.message });
  }
};

// 🗑️ Delete Fee
export const deleteFee = async (req, res) => {
  try {
    const deleted = await Fee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Fee not found" });

    res.status(200).json({ message: "Fee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting fee", error: err.message });
  }
};



// Get fee by class (for student dashboard)
// ✅ Get fee by className (handles 7A, 7B, 7C by extracting numeric part)
// ✅ Updated: Supports both "7" and "Class 7"
export const getFeeByClassName = async (req, res) => {
  try {
    const fullClassName = req.params.className; // e.g., "7A", "8B", etc.
    const classLevel = fullClassName.match(/\d+/)?.[0]; // Extracts "7"

    if (!classLevel) {
      return res.status(400).json({ message: "Invalid class name" });
    }

    // Try matching both plain "7" and "Class 7"
    const fee =
      (await Fee.findOne({ className: classLevel })) ||
      (await Fee.findOne({ className: `Class ${classLevel}` }));

    if (!fee) {
      return res
        .status(404)
        .json({ message: "Fee structure not found for your class" });
    }

    res.status(200).json(fee);
  } catch (err) {
    console.error("❌ Error fetching fee by class:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get Fee Structure by Student ID
export const getFeeByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Extract class name (and optionally section)
    const classLevel = student.className.match(/\d+/)?.[0];

    if (!classLevel) {
      return res.status(400).json({ message: "Invalid class name on student" });
    }

    // Find fee structure
    const fee =
      (await Fee.findOne({ className: classLevel })) ||
      (await Fee.findOne({ className: `Class ${classLevel}` }));

    if (!fee) {
      return res.status(404).json({ message: "Fee structure not found for your class" });
    }

    // Build response with paid info
    const totalPaid = student.payments?.reduce((sum, p) => sum + p.amountPaid, 0) || 0;
    const due = fee.amount - totalPaid;

    const result = {
      ...fee.toObject(),
      totalFee: fee.amount,
      totalPaid,
      due,
      hasPaidFull: totalPaid >= fee.amount,
      hasPaidHalf: totalPaid >= fee.amount / 2 && totalPaid < fee.amount,
      section: student.section,
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error fetching fee structure by student ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};