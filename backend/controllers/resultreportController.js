import Student from "../models/studentModel.js";
import Result from "../models/Result.js";

export const getClassWiseResults = async (req, res) => {
  try {
    const classes = await Student.distinct("className");

    const classWiseResults = [];

    for (const className of classes) {
      const students = await Student.find({ className });

      const studentIds = students.map((s) => s._id);

      // ✅ Fetch all results for all students in this class in one query
      const results = await Result.find({ student: { $in: studentIds } });

      // ✅ Group results by studentId
      const resultMap = {};
      for (const result of results) {
        const sid = result.student.toString();
        if (!resultMap[sid]) {
          resultMap[sid] = [];
        }
        resultMap[sid].push(result);
      }

      const studentResults = students.map((student) => ({
        studentId: student._id,
        studentName: student.name,
        rollNo: student.rollNo,
        class: student.className,
        section: student.section,
        results: resultMap[student._id.toString()] || [],
      }));

      classWiseResults.push({
        class: className,
        students: studentResults,
      });
    }

    res.status(200).json({
      success: true,
      data: classWiseResults,
    });
  } catch (error) {
    console.error("❌ Error in getClassWiseResults:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
