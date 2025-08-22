import Result from "../models/Result.js";
import Student from "../models/Student.js";

// 🧠 Grade Calculator
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

// 🔁 Bulk Create Results
const bulkCreateResults = async (req, res) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: "No results provided" });
    }

    const formatted = [];
    const skipped = [];

    for (const entry of results) {
      const { studentId, term, year, subjects } = entry;
      if (!studentId || !term || !year || !Array.isArray(subjects)) {
        skipped.push({ reason: "Missing fields", entry });
        continue;
      }

      const studentDoc = await Student.findById(studentId);
      if (!studentDoc) {
        skipped.push({ reason: "Student not found", entry });
        continue;
      }

      const exists = await Result.findOne({ student: studentDoc._id, term, year });
      if (exists) {
        skipped.push({ reason: "Duplicate result", student: studentDoc.name });
        continue;
      }

      const cleanSubjects = subjects.map(s => ({
        name: s.name.trim(),
        marks: Number(s.marksObtained),
        maxMarks: Number(s.outOf || 100),
      })).filter(s => s.name && !isNaN(s.marks));

      if (!cleanSubjects.length) {
        skipped.push({ reason: "No valid subjects", student: studentDoc.name });
        continue;
      }

      const total = cleanSubjects.reduce((sum, s) => sum + s.marks, 0);
      const maxTotal = cleanSubjects.reduce((sum, s) => sum + s.maxMarks, 0);
      const percentage = +(total / maxTotal * 100).toFixed(2);
      const grade = calculateGrade(percentage);

      formatted.push({
        student: studentDoc._id,
        studentName: studentDoc.name,
        studentRoll: studentDoc.rollNumber,
        className: studentDoc.class,
        term,
        year,
        subjects: cleanSubjects,
        total,
        percentage,
        grade,
      });
    }

    if (!formatted.length) {
      return res.status(400).json({ message: "No valid results to insert", skipped });
    }

    const inserted = await Result.insertMany(formatted);
    res.status(201).json({ message: `✅ ${inserted.length} results saved`, skipped });
  } catch (err) {
    console.error("❌ bulkCreateResults error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🧾 Create Single Result
const createResult = async (req, res) => {
  try {
    const { studentId, term, year, subjects } = req.body;
    if (!studentId || !term || !year || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existing = await Result.findOne({ student: student._id, term, year });
    if (existing) {
      return res.status(400).json({ message: `Result already exists for ${term} ${year}` });
    }

    const formattedSubjects = subjects.map(s => ({
      name: s.name.trim(),
      marks: Number(s.marksObtained),
      maxMarks: Number(s.outOf || 100),
    })).filter(s => s.name && !isNaN(s.marks));

    const total = formattedSubjects.reduce((sum, s) => sum + s.marks, 0);
    const maxTotal = formattedSubjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = +(total / maxTotal * 100).toFixed(2);
    const grade = calculateGrade(percentage);

    const result = await Result.create({
      student: student._id,
      studentName: student.name,
      studentRoll: student.rollNumber,
      className: student.class,
      term,
      year,
      total,
      percentage,
      grade,
      subjects: formattedSubjects,
    });

    res.status(201).json({ message: "✅ Result created", result });
  } catch (err) {
    console.error("❌ createResult error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Update Result (Admin Only)
const updateResult = async (req, res) => {
  try {
    const resultId = req.params.id;
    const { subjects, term, year } = req.body;

    const existing = await Result.findById(resultId);
    if (!existing) return res.status(404).json({ message: "Result not found" });

    const cleanSubjects = subjects.map(s => ({
      name: s.name.trim(),
      marks: Number(s.marksObtained),
      maxMarks: Number(s.outOf || 100),
    })).filter(s => s.name && !isNaN(s.marks));

    const total = cleanSubjects.reduce((sum, s) => sum + s.marks, 0);
    const maxTotal = cleanSubjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = +(total / maxTotal * 100).toFixed(2);
    const grade = calculateGrade(percentage);

    const updated = await Result.findByIdAndUpdate(resultId, {
      subjects: cleanSubjects,
      total,
      percentage,
      grade,
      ...(term && { term }),
      ...(year && { year }),
    }, { new: true });

    res.status(200).json({ message: "✅ Result updated", updated });
  } catch (err) {
    console.error("❌ updateResult error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🧑‍🎓 Get Result by Student ID
const getResultByStudentId = async (req, res) => {
  try {
    if (req.user.role === "student" && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const results = await Result.find({ student: req.params.studentId }).lean();
    if (!results.length) return res.status(404).json({ message: "No results found" });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔍 Get by Roll Number
const getResultByRollNo = async (req, res) => {
  try {
    const results = await Result.find({ studentRoll: req.params.rollNo });
    if (!results.length) return res.status(404).json({ message: "No results found" });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 Get All Results
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Result
const deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "✅ Result deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👥 Get Students by Class & Section
const getStudentsByClassSection = async (req, res) => {
  try {
    const input = req.params.classSection;
    const className = input.match(/^\d+/)?.[0];
    const section = input.match(/[A-Z]$/i)?.[0];

    const query = section ? { class: className, section } : { class: className };
    const students = await Student.find(query).select("_id name rollNumber");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 Exports
export {
  createResult,
  bulkCreateResults,
  getResultByStudentId,
  deleteResult,
  getAllResults,
  getStudentsByClassSection,
  getResultByRollNo,
  updateResult, // ✅ New export
};
