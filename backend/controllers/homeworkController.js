import Homework from "../models/homeworkModel.js";

// ✅ Admin creates homework
export const createHomework = async (req, res) => {
  try {
    const { classLevel, subject, title, description, fileUrl, dueDate } = req.body;

    if (!classLevel || !subject || !title) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const homework = new Homework({
      classLevel,
      subject,
      title,
      description,
      fileUrl,
      dueDate,
      uploadedBy: req.user.email,
    });

    await homework.save();
    res.status(201).json({ message: "Homework created successfully", homework });
  } catch (error) {
    res.status(500).json({ message: "Error creating homework", error });
  }
};

// 🧑‍🎓 Student fetches homework by class level
export const getHomeworkByStudentClass = async (req, res) => {
  try {
    const classLevel = parseInt(req.params.classLevel); // e.g., 6
    if (isNaN(classLevel)) {
      return res.status(400).json({ message: "Invalid class level" });
    }

    const homeworkList = await Homework.find({ classLevel }).sort({ dueDate: 1 });
    res.status(200).json(homeworkList);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch homework", error });
  }
};

// ❌ Admin deletes homework
export const deleteHomework = async (req, res) => {
  try {
    const id = req.params.id;
    const homework = await Homework.findByIdAndDelete(id);

    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    res.status(200).json({ message: "Homework deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting homework", error });
  }
};
