import Subject from "../models/Subject.js";

// ➕ Create Subject
export const createSubject = async (req, res) => {
  try {
    const { className, name } = req.body;
    if (!className || !name) {
      return res.status(400).json({ message: "Class name and subject name are required" });
    }

    const exists = await Subject.findOne({ className, name });
    if (exists) {
      return res.status(400).json({ message: "Subject already exists for this class" });
    }

    const subject = await Subject.create({ className, name });
    res.status(201).json({ message: "✅ Subject created", subject });
  } catch (err) {
    console.error("❌ Create subject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📄 Get Subjects by Class
export const getSubjectsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const subjects = await Subject.find({ className });
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗂 Get All Subjects (for admin panel)
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ className: 1, name: 1 });
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📝 Update Subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, className } = req.body;

    const updated = await Subject.findByIdAndUpdate(
      id,
      { name, className },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "✅ Subject updated", updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({ message: "🗑️ Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
