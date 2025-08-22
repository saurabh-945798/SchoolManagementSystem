import express from "express";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import Result from "../models/resultModel.js";
import Attendance from "../models/attendanceModel.js";

const router = express.Router();

// ✅ GET student details by roll number and DOB (used for login)
router.post("/login", async (req, res) => {
  const { rollNo, dob } = req.body;

  try {
    const student = await Student.findOne({ rollNo, dob });
    if (!student) {
      return res.status(404).json({ message: "Invalid roll number or DOB" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
});

// ✅ GET full dashboard info using student ID
router.get("/dashboard/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get assigned teacher(s)
    const teachers = await Teacher.find({
      assignedClasses: {
        $in: [`${student.className}${student.section}`],
      },
    }).select("name email");

    // Get attendance for this student
    const attendanceRecords = await Attendance.find({
      className: student.className,
      section: student.section,
      "students.studentId": student._id,
    });

    // Format attendance
    const attendanceSummary = attendanceRecords.map((record) => {
      const studentAttendance = record.students.find((s) =>
        s.studentId.toString() === student._id.toString()
      );
      return {
        date: record.date,
        status: studentAttendance?.status || "N/A",
        markedBy: record.teacherId, // you can also populate if needed
      };
    });

    // Get results
    const results = await Result.findOne({
      rollNo: student.rollNo,
    });

    res.status(200).json({
      student,
      assignedTeachers: teachers,
      attendance: attendanceSummary,
      results: results || null,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard fetch failed", error });
  }
});

export default router;
