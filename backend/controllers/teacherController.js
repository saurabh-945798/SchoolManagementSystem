import Teacher from '../models/Teacher.js';


// ✅ Get all teachers

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 }).select('-password');

    res.status(200).json(teachers);
  } catch (err) {
    console.error("❌ getAllTeachers:", err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};


// ✅ Get teacher by ID
export const getTeacherById = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findById(teacherId).select('-password');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json(teacher);
  } catch (err) {
    console.error("❌ getTeacherById:", err);
    res.status(500).json({ error: 'Error fetching teacher', details: err.message });
  }
};

// ✅ Update teacher info
export const updateTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const updateFields = { ...req.body };

  try {
    // Validate classesAssigned is array if present
    if (updateFields.classesAssigned && !Array.isArray(updateFields.classesAssigned)) {
      return res.status(400).json({ message: "classesAssigned must be an array" });
    }

    // Convert experience to number if sent as string
    if (updateFields.experience) {
      updateFields.experience = Number(updateFields.experience);
    }

    // Convert joiningDate to Date object if sent as string
    if (updateFields.joiningDate) {
      updateFields.joiningDate = new Date(updateFields.joiningDate);
    }

    // Convert dob to Date object if sent as string
    if (updateFields.dob) {
      updateFields.dob = new Date(updateFields.dob);
    }

    // Convert subjects string to array if needed (e.g. "Physics,Math" => ['Physics', 'Math'])
    if (updateFields.subjects && typeof updateFields.subjects === 'string') {
      updateFields.subjects = updateFields.subjects.split(',').map((s) => s.trim());
    }

    // Here if you want, you can add code to update photoUrl or handle password change securely

    const updated = await Teacher.findByIdAndUpdate(teacherId, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ updateTeacher:", err);
    res.status(500).json({ error: 'Failed to update teacher', details: err.message });
  }
};

// ✅ Assign/update classes
export const assignClassesToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { classNames } = req.body; // Example: ["8C", "7A"]

    if (!Array.isArray(classNames)) {
      return res.status(400).json({ message: "classNames must be an array" });
    }

    // 🔍 Find classes by name
    const foundClasses = await Class.find({ name: { $in: classNames } });

    if (foundClasses.length !== classNames.length) {
      return res.status(404).json({ message: "Some classes not found" });
    }

    const classIds = foundClasses.map((cls) => cls._id);

    // 🧠 Update teacher's assigned classes
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { classesAssigned: classIds },
      { new: true }
    ).populate("classesAssigned", "name section"); // Optional: populate class info

    res.status(200).json({
      message: "Classes assigned successfully",
      updatedTeacher,
    });
  } catch (err) {
    console.error("❌ Error while assigning classes:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Optional: get classes for a specific teacher (helper)
export const getAssignedClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).populate(
      "classesAssigned",
      "name section"
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Format assigned classes like "8A", "10B"
    const assignedClasses = teacher.classesAssigned.map(
      (cls) => `${cls.name}${cls.section}`
    );

    res.status(200).json({ assignedClasses });
  } catch (err) {
    console.error("❌ Error while fetching assigned classes:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete teacher
export const deleteTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const deleted = await Teacher.findByIdAndDelete(teacherId);
    if (!deleted) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error("❌ deleteTeacher:", err);
    res.status(500).json({ error: 'Failed to delete teacher', details: err.message });
  }
};


export const updateTeacherAssignedClass = async (req, res) => {
  try {
    const { teacherId, className } = req.body;

    const foundClass = await Class.findOne({ name: className });

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { classesAssigned: [foundClass._id] },
      { new: true }
    );

    res.status(200).json({
      message: "Class assigned successfully",
      updatedTeacher,
    });
  } catch (err) {
    console.error("❌ Error while updating teacher class:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
