import Teacher from '../models/Teacher.js';
export const getAssignedClasses = async (req, res) => {
  try {
    // Get teacher using ID from token (set by verifyToken middleware)
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Directly send the string array of classes
    res.status(200).json({
      assignedClasses: teacher.classesAssigned,
    });
  } catch (err) {
    console.error("❌ Error fetching assigned classes:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id)
      .select('-password'); // ✅ classesAssigned ko hatao mat

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (err) {
    console.error('getTeacherProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};










export const getLoggedInTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.user.id }).select('-password'); // remove password field
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.json(teacher);
  } catch (err) {
    console.error('❌ Error fetching teacher info:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getStudentsByClassSection = async (req, res) => {
  const className = req.params.className;
  const classLevel = className.slice(0, -1);
  const section = className.slice(-1).toUpperCase();

  try {
    const students = await Student.find({
      className: classLevel,
      section: section,
    }).select("name rollNumber"); // ✅ corrected field

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};
