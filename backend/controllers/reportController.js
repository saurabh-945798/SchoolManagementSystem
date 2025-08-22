import Student from "../models/studentModel.js";
import Result from "../models/Result.js";
import Attendance from "../models/Attendance.js";



// 🧠 Helper to check if grade is pass
const isPass = (grade = "") => {
  const failGrades = ["F", "E", "N/A"];
  return !failGrades.includes(grade.toUpperCase());
};

// ✅ GET detailed report for a specific class
export const getClassDetailedReport = async (req, res) => {
  const className = req.params.className;

  try {
    const students = await Student.find({ className });

    if (!students.length) {
      return res.status(404).json({ message: "No students found in this class." });
    }

    const attendanceRecords = await Attendance.find({ className });

    const studentReports = [];

    for (const student of students) {
      const studentAttendance = [];

      attendanceRecords.forEach((record) => {
        const found = record.students.find((s) =>
          s.studentId.toString() === student._id.toString()
        );
        if (found) {
          studentAttendance.push({
            date: record.date,
            status: found.status,
          });
        }
      });

      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter((a) => a.status === "Present").length;
      const attendancePercent = totalDays > 0
        ? ((presentDays / totalDays) * 100).toFixed(2)
        : "0.00";

      const result = await Result.findOne({ studentId: student._id }).sort({ createdAt: -1 });

      const subjects = result?.subjects || [];
      const total = result?.total || 0;
      const percentage = result?.percentage || 0;
      const grade = result?.grade || "N/A";
      const term = result?.term || "N/A";
      const year = result?.year || "N/A";
      const passed = isPass(grade);

      studentReports.push({
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        attendance: {
          totalDays,
          presentDays,
          attendancePercent,
        },
        result: {
          subjects,
          total,
          percentage,
          grade,
          term,
          year,
        },
        passed,
      });
    }

    const strength = studentReports.length;
    const passCount = studentReports.filter((s) => s.passed).length;
    const failCount = strength - passCount;
    const avgAttendance = (
      studentReports.reduce((sum, s) => sum + parseFloat(s.attendance.attendancePercent), 0) / strength
    ).toFixed(2);

    res.status(200).json({
      className,
      strength,
      passed: passCount,
      failed: failCount,
      averageAttendance: avgAttendance,
      students: studentReports,
    });
  } catch (err) {
    console.error("❌ Error in getClassDetailedReport:", err);
    res.status(500).json({ message: "Failed to fetch class report", error: err.message });
  }
};


// ✅ GET summary reports for all classes
export const getAllClassSummaryReports = async (req, res) => {
  try {
    const students = await Student.find();

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    const attendanceRecords = await Attendance.find();
    const classMap = {};

    for (const student of students) {
      if (!classMap[student.className]) classMap[student.className] = [];
      classMap[student.className].push(student);
    }

    const reports = [];

    for (const className in classMap) {
      const classStudents = classMap[className];
      const strength = classStudents.length;

      let passCount = 0;
      let totalAttendance = 0;

      for (const stu of classStudents) {
        // Grade logic
        const result = await Result.findOne({ studentId: stu._id }).sort({ createdAt: -1 });
        const grade = result?.grade || "F";
        if (isPass(grade)) passCount++;

        // Attendance logic from Attendance collection
        let stuAttendanceCount = 0;
        let stuPresentCount = 0;

        attendanceRecords.forEach((record) => {
          if (record.className === className) {
            const entry = record.students.find(
              (s) => s.studentId.toString() === stu._id.toString()
            );
            if (entry) {
              stuAttendanceCount += 1;
              if (entry.status === "Present") stuPresentCount += 1;
            }
          }
        });

        const percent = stuAttendanceCount > 0
          ? (stuPresentCount / stuAttendanceCount) * 100
          : 0;

        totalAttendance += percent;
      }

      const failCount = strength - passCount;
      const avgAttendance = (totalAttendance / strength).toFixed(2);

      reports.push({
        className,
        strength,
        passed: passCount,
        failed: failCount,
        averageAttendance: avgAttendance,
      });
    }

    res.status(200).json(reports);
  } catch (err) {
    console.error("❌ Error in getAllClassSummaryReports:", err);
    res.status(500).json({ message: "Failed to fetch all class summaries", error: err.message });
  }
};

// ✅ Get attendance report of all students (grouped by class)
export const getAllStudentsAttendance = async (req, res) => {
  try {
    const allStudents = await Student.find();
    const allAttendance = await Attendance.find();

    const studentMap = {};

    // Setup map for each student
    allStudents.forEach((stu) => {
      studentMap[stu._id.toString()] = {
        name: stu.name,
        rollNo: stu.rollNo,
        className: stu.className,
        totalDays: 0,
        presentDays: 0,
      };
    });

    // Count attendance
    allAttendance.forEach((record) => {
      record.students.forEach((entry) => {
        const id = entry.studentId.toString();
        if (studentMap[id]) {
          studentMap[id].totalDays += 1;
          if (entry.status === "Present") {
            studentMap[id].presentDays += 1;
          }
        }
      });
    });

    // Group by class
    const classMap = {};

    Object.values(studentMap).forEach((stu) => {
      const attendancePercent = stu.totalDays > 0
        ? ((stu.presentDays / stu.totalDays) * 100).toFixed(2)
        : "0.00";

      if (!classMap[stu.className]) classMap[stu.className] = [];

      classMap[stu.className].push({
        name: stu.name,
        rollNo: stu.rollNo,
        totalDays: stu.totalDays,
        presentDays: stu.presentDays,
        attendancePercent,
      });
    });

    res.status(200).json({ attendance: classMap });
  } catch (error) {
    console.error("❌ Error fetching all students' attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
};

// ✅ Get today's absent students
export const getAbsentStudents = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const students = await Student.find();

    const absentees = students.filter((stu) =>
      stu.attendance?.some(
        (a) => a.date.toISOString().split("T")[0] === today && a.status === "absent"
      )
    );

    res.status(200).json({ date: today, count: absentees.length, absentees });
  } catch (error) {
    console.error("❌ Error fetching absentees:", error);
    res.status(500).json({ message: "Failed to fetch absentees", error: error.message });
  }
};












export const getAllAttendanceForAdmin = async (req, res) => {
  try {
    const allStudents = await Student.find({});
    const allAttendanceRecords = await Attendance.find({});
    
    // 🌀 Set up class-based attendance map
    const attendanceMap = {};
    allStudents.forEach((student) => {
      const key = student.className;
      if (!attendanceMap[key]) attendanceMap[key] = [];

      attendanceMap[key].push({
        studentId: student._id,      // 🌟 Add studentId
        name: student.name,
        rollNo: student.rollNo,
        presentDays: 0,
        totalDays: 0,
        resultPercentage: null      // 🌟 Placeholder
      });
    });

    // 🔁 Tally attendance per student
    allAttendanceRecords.forEach((record) => {
      const classKey = record.className;
      if (!attendanceMap[classKey]) return;

      record.students.forEach((entry) => {
        const student = attendanceMap[classKey].find(
          (s) => s.rollNo === entry.rollNo
        );
        if (student) {
          student.totalDays += 1;
          if (entry.status === "Present") student.presentDays += 1;
        }
      });
    });

    // ✅ Compute attendancePercentage
    Object.values(attendanceMap).forEach((students) => {
      students.forEach((s) => {
        s.attendancePercent =
          s.totalDays > 0
            ? Math.round((s.presentDays / s.totalDays) * 100)
            : 0;
      });
    });

    // 🔍 Fetch latest result percentages for all students
    const studentIds = allStudents.map((s) => s._id);
    const latestResults = await Result.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$studentId",
          percentage: { $first: "$percentage" }
        }
      }
    ]);
    const resultMap = latestResults.reduce((map, r) => {
      map[r._id.toString()] = Math.round(r.percentage);
      return map;
    }, {});

    // 💡 Attach resultPercentage to students
    Object.values(attendanceMap).forEach((students) => {
      students.forEach((s) => {
        s.resultPercentage = resultMap[s.studentId.toString()] || 0;
      });
    });

    return res.json({ attendance: attendanceMap });
  } catch (error) {
    console.error("❌ Error in getAllAttendanceForAdmin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const getLatestResultsForAllStudents = async (req, res) => {
  const { className } = req.query; // optional filter

  try {
    // Filter students by class if provided
    const studentFilter = className ? { className } : {};
    const students = await Student.find(studentFilter);

    if (!students.length) {
      return res.status(404).json({ message: "No students found." });
    }

    const resultData = [];

    for (const stu of students) {
      const latestResult = await Result.findOne({ studentId: stu._id }).sort({ createdAt: -1 });

      resultData.push({
        studentId: stu._id,
        name: stu.name,
        rollNo: stu.rollNo,
        className: stu.className,
        result: latestResult
          ? {
              percentage: latestResult.percentage,
              grade: latestResult.grade,
              term: latestResult.term,
              year: latestResult.year,
              total: latestResult.total,
              subjects: latestResult.subjects,
            }
          : null,
      });
    }

    res.status(200).json({ students: resultData });
  } catch (error) {
    console.error("❌ Error in getLatestResultsForAllStudents:", error);
    res.status(500).json({ message: "Failed to fetch results", error: error.message });
  }
};


export const getAllAttendanceWithResults = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students.length) {
      return res.status(404).json({ message: "No students found." });
    }

    const attendanceRecords = await Attendance.find();
    const results = await Result.find().sort({ createdAt: -1 });

    const latestResultMap = {};
    for (const result of results) {
      const studentId = result?.studentId?.toString?.(); // ✅ protect toString call
      if (studentId && !latestResultMap[studentId]) {
        latestResultMap[studentId] = result;
      }
    }

    const classData = {};

    for (const student of students) {
      let presentDays = 0;
      let totalDays = 0;

      attendanceRecords.forEach((record) => {
        const entry = record?.students?.find(
          (s) => s?.studentId?.toString?.() === student._id.toString()
        );
        if (entry) {
          totalDays += 1;
          if (entry.status === "Present") presentDays += 1;
        }
      });

      const resultData = latestResultMap[student._id.toString()];
      const resultPercentage = resultData ? resultData.percentage : null;

      const entry = {
        name: student.name,
        rollNo: student.rollNo,
        className: student.className,
        presentDays,
        totalDays,
        attendancePercent:
          totalDays > 0
            ? ((presentDays / totalDays) * 100).toFixed(2)
            : "0.00",
        resultPercentage,
      };

      if (!classData[student.className]) {
        classData[student.className] = [];
      }

      classData[student.className].push(entry);
    }

    // ✅ Send plain object (no "attendance" wrapper)
    res.status(200).json(classData);
  } catch (error) {
    console.error("❌ getAllAttendanceWithResults error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const getAttendanceSummary = async (req, res) => {
  try {
    const allStudents = await Student.find();
    const attendanceRecords = await Attendance.find();

    const summary = [];

    const classGroups = {};
    allStudents.forEach((student) => {
      const cls = `${student.className}${student.section}`;
      if (!classGroups[cls]) classGroups[cls] = [];
      classGroups[cls].push(student);
    });

    for (const className in classGroups) {
      const students = classGroups[className];
      const studentIds = students.map((s) => s._id.toString());

      let totalRecords = 0;
      let presentCount = 0;

      attendanceRecords.forEach((record) => {
        if (record.className === className) {
          record.students.forEach((entry) => {
            if (studentIds.includes(entry.studentId.toString())) {
              totalRecords++;
              if (entry.status === "Present") presentCount++;
            }
          });
        }
      });

      const percentage = totalRecords === 0 ? 0 : Math.round((presentCount / totalRecords) * 100);
      summary.push({
        className,
        totalStudents: students.length,
        attendanceRecords: totalRecords,
        percentage,
      });
    }

    res.json({ summary });
  } catch (err) {
    console.error("❌ Error generating attendance summary:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};



