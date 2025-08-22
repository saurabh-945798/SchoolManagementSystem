import Student from '../models/Student.js';

// ✅ Add a new student
export const addStudent = async (req, res) => {
  try {
    const data = { ...req.body };

    // Normalize class and section values before saving
    if (data.class) {
      data.class = data.class.replace(/\s+/g, '').toLowerCase(); // e.g., 'Class 3' → 'class3'
    }
    if (data.section) {
      data.section = data.section.trim().toUpperCase(); // e.g., ' a ' → 'A'
    }

    const student = new Student(data);
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get all students (optionally filtered by class or section)
// ✅ Get all students (optionally filtered by class or section)
export const getAllStudents = async (req, res) => {
  try {
    const query = {};

    // Normalize class (e.g., 'Class 3', 'class 3', '3' => '3')
    if (req.query.class) {
      const classOnlyNumber = req.query.class.replace(/[^0-9]/g, '');
      query.class = classOnlyNumber;
    }

    // Normalize section (e.g., 'a' => 'A')
    if (req.query.section) {
      query.section = req.query.section.toUpperCase();
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a student
export const updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Optional: Normalize class and section on update as well
    if (updateData.class) {
      updateData.class = updateData.class.replace(/\s+/g, '').toLowerCase();
    }
    if (updateData.section) {
      updateData.section = updateData.section.trim().toUpperCase();
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getStudentsByClassSection = async (req, res) => {
  try {
    const { classSection } = req.params;

    const className = classSection.slice(0, -1);
    const section = classSection.slice(-1).toUpperCase();

    const students = await Student.find({ class: className, section });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found." });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};