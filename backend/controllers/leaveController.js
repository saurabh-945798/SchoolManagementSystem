import LeaveApplication from "../models/LeaveApplication.js";
import Student from "../models/Student.js";

// 📌 Apply for leave (student)
export const applyForLeave = async (req, res) => {
  try {
    console.log("📥 Incoming apply request:", req.body);
    console.log("🔑 Token user:", req.user);

    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized: Student ID missing." });
    }

    const { leaveType, fromDate, toDate, reason, certificateUrl } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // ✅ Leave policy validation
    if (leaveType === "medical" && (diffDays < 7 || diffDays > 21)) {
      return res.status(400).json({ message: "Medical leave must be between 7-21 days." });
    }
    if (leaveType === "event" && diffDays > 7) {
      return res.status(400).json({ message: "Event leave cannot exceed 7 days." });
    }
    if (leaveType === "activity" && diffDays !== 1) {
      return res.status(400).json({ message: "Activity leave must be exactly 1 day." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newLeave = new LeaveApplication({
      studentId,
      studentName: student.name,
      rollNo: student.rollNumber,
      className: student.class,
      leaveType,
      fromDate,
      toDate,
      reason,
      certificateUrl: certificateUrl || null,
    });

    try {
      await newLeave.save();
    } catch (saveErr) {
      console.error("❌ Save error:", saveErr.message);
      return res.status(500).json({ message: "Mongo Save Failed", error: saveErr.message });
    }

    res.status(201).json({ message: "Leave applied successfully", leave: newLeave });
  } catch (err) {
    console.error("❌ Controller Error:", err.message);
    res.status(500).json({ message: "Error applying for leave", error: err.message });
  }
};

// 🧾 Upload certificate (PDF only)
export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `/uploads/certificates/${req.file.filename}`;
    return res.status(200).json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Upload certificate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload certificate",
      error: err.message,
    });
  }
};

// 📩 Admin: Get all leave applications
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.find().sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    console.error("Get all leaves error:", err);
    res.status(500).json({ message: "Failed to fetch leave applications" });
  }
};

// 📩 Student: Get leave history (own)
export const getLeaveByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && req.user.id);

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const leaves = await LeaveApplication.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    console.error("Get leave by student error:", err);
    res.status(500).json({ message: "Failed to fetch leaves for student", error: err.message });
  }
};

// ✅ Admin: Approve or Reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.status(200).json({ message: "Leave status updated", updated });
  } catch (err) {
    console.error("Update leave status error:", err);
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

// ❌ Admin: Delete leave request
export const deleteLeaveRequest = async (req, res) => {
  try {
    const deleted = await LeaveApplication.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.status(200).json({ message: "Leave request deleted successfully" });
  } catch (err) {
    console.error("Delete leave request error:", err);
    res.status(500).json({ message: "Failed to delete leave request", error: err.message });
  }
};
