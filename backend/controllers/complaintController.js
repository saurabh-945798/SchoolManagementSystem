import Complaint from "../models/Complaint.js";
import Student from "../models/Student.js";

// 📌 Student: Create complaint
export const createComplaint = async (req, res) => {
  try {
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized: Student ID missing from token." });
    }

    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Missing required fields: title, description, category." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newComplaint = new Complaint({
      studentId,
      studentName: student.name,
      rollNo: student.rollNumber,
      className: student.class,
      title,
      description,
      category,
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaint: newComplaint });
  } catch (err) {
    console.error("❌ Complaint creation error:", err.message);
    res.status(500).json({ message: "Failed to create complaint", error: err.message });
  }
};

// 📩 Student: Get own complaints history
export const getMyComplaints = async (req, res) => {
  try {
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized: Student ID missing" });
    }

    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Get student complaints error:", err.message);
    res.status(500).json({ message: "Failed to fetch complaints", error: err.message });
  }
};

// 📜 Admin: Get all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Admin fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch all complaints", error: err.message });
  }
};

// ✅ Admin: Update complaint status (approve / reject / pending)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }

    await complaint.save();
    res.status(200).json({ message: `Complaint ${status} successfully`, complaint });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ message: "Failed to update complaint status", error: err.message });
  }
};

// ❌ Admin: Delete complaint
export const deleteComplaintByAdmin = async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ message: "Failed to delete complaint", error: err.message });
  }
};

// ❌ Student: Delete own complaint
export const deleteComplaintByStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.studentId.toString() !== studentId) {
      return res.status(403).json({ message: "You can only delete your own complaints" });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Student delete error:", err.message);
    res.status(500).json({ message: "Failed to delete complaint", error: err.message });
  }
};
