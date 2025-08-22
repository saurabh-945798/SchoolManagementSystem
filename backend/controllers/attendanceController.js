import Attendance from "../models/Attendance.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import { sendBulkSMS } from "../utils/sendSMS.js";
import mongoose from "mongoose";

// ✅ MARK ATTENDANCE
export const markAttendance = async (req, res) => {
  try {
    let { className, section, date, attendanceList } = req.body;

    // ✅ Basic validation
    if (!className || !date || !Array.isArray(attendanceList)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Restrict marking for only today's date
    const inputDate = new Date(date).toDateString();
    const today = new Date().toDateString();
    if (inputDate !== today) {
      return res.status(400).json({
        message: "❌ Attendance can only be marked for today",
      });
    }

    // ✅ Extract section if embedded in className (e.g., "10A")
    if (!section && className.length > 1) {
      section = className.slice(-1).toUpperCase();
      className = className.slice(0, -1);
    }

    // ✅ Check if attendance already marked for this class-section-date
    const alreadyMarked = await Attendance.findOne({ className, section, date });
    if (alreadyMarked) {
      return res.status(400).json({
        message: `⚠️ Attendance already marked for Class ${className}${section} on ${date}`,
      });
    }

    // ✅ Verify teacher
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // ✅ Enrich student data
    const enrichedList = await Promise.all(
      attendanceList.map(async (entry) => {
        const student = await Student.findById(entry.studentId);
        return {
          studentId: entry.studentId,
          studentName: student?.name || entry.studentName || "Unknown",
          rollNo: student?.rollNo || "N/A",
          status: entry.status,
        };
      })
    );

    // ✅ Save attendance
    const attendance = new Attendance({
      className,
      section,
      date,
      teacherId: teacher._id,
      students: enrichedList,
    });

    await attendance.save();

    // ✅ Prepare SMS alerts for absentees
    const absentStudents = enrichedList.filter((s) => s.status === "Absent");

    const messages = await Promise.all(
      absentStudents.map(async (entry) => {
        const stu = await Student.findById(entry.studentId);
        if (stu?.fatherMobile) {
          return {
            mobile: stu.fatherMobile,
            message: `Dear Parent, your ward ${stu.name} (Roll No: ${stu.rollNo}) was absent today.`,
          };
        }
        return null;
      })
    );

    const filteredMessages = messages.filter(Boolean);
    if (filteredMessages.length > 0) {
      await sendBulkSMS(filteredMessages); // 🔔 SMS to parents
    }

    res.status(201).json({
      message: "✅ Attendance submitted",
      attendance,
      toNotify: filteredMessages,
    });
  } catch (error) {
    console.error("❌ Error saving attendance:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET ATTENDANCE BY CLASS & SECTION
export const getClassAttendance = async (req, res) => {
  try {
    const { classSection } = req.params;
    const className = classSection.slice(0, -1);
    const section = classSection.slice(-1).toUpperCase();

    const attendanceRecords = await Attendance.find({ className, section });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error("❌ Error fetching class-wise attendance:", err.message);
    res.status(500).json({ message: "Error fetching attendance records" });
  }
};

// ✅ GET ATTENDANCE BY studentId (used by student portal)
export const getStudentAttendanceById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const records = await Attendance.find({
      "students.studentId": new mongoose.Types.ObjectId(studentId),
    });

    const attendance = records.map((record) => {
      const studentEntry = record.students.find(
        (s) => s.studentId.toString() === studentId
      );
      return {
        date: record.date,
        status: studentEntry ? studentEntry.status : "N/A",
      };
    });

    const presentDays = attendance.filter((a) => a.status === "Present").length;

    res.status(200).json({
      totalDays: attendance.length,
      presentDays,
      percentage:
        attendance.length === 0
          ? 0
          : Math.round((presentDays / attendance.length) * 100),
      attendance,
    });
  } catch (error) {
    console.error("❌ Error fetching student attendance:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET BY ROLL NO (if needed)
export const getStudentAttendanceByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const records = await Attendance.find({ "students.studentId": student._id });

    const attendanceList = records.map((rec) => {
      const entry = rec.students.find(
        (s) => s.studentId.toString() === student._id.toString()
      );
      return {
        date: rec.date,
        status: entry?.status || "Absent",
      };
    });

    const total = attendanceList.length;
    const present = attendanceList.filter((a) => a.status === "Present").length;

    res.status(200).json({
      student: {
        name: student.name,
        rollNo: student.rollNo,
      },
      totalDays: total,
      presentDays: present,
      percentage: total === 0 ? 0 : Math.round((present / total) * 100),
      attendance: attendanceList,
    });
  } catch (err) {
    console.error("❌ Error fetching attendance by roll:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ABSENTEES FOR ADMIN
export const getAbsentees = async (req, res) => {
  try {
    const { classSection, date } = req.query; // query params
    const searchDate = date || new Date().toISOString().split("T")[0];

    const start = new Date(searchDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(searchDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: start, $lte: end }
    };
    if (classSection) {
      query.className = classSection;
    }

    const attendanceRecords = await Attendance.find(query);

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance found for given date." });
    }

    const absentStudents = [];
    for (const record of attendanceRecords) {
      const absentees = record.students.filter(s => s.status === "Absent");

      for (const entry of absentees) {
        const stu = await Student.findById(entry.studentId);

        if (stu) {
          absentStudents.push({
            _id: stu._id,
            name: stu.name || "Unknown",
            rollNumber: stu.rollNumber || "N/A",
            class: stu.class || "N/A",
            section: stu.section || "N/A",
            fatherName: stu.fatherName || "N/A",
            fatherPhone: stu.fatherPhone || "N/A",
          });
        }
      }
    }

    res.status(200).json(absentStudents);
  } catch (err) {
    console.error("❌ Error fetching absentees:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ ADMIN REPORT (date-wise + full details + overall %)
export const getAllAttendanceForAdmin = async (req, res) => {
  try {
    const { className } = req.params; // e.g., "6"

    // Fetch attendance for all sections of the class (e.g., 6A, 6B)
    const attendanceRecords = await Attendance.find({
      classSection: { $regex: `^${className}`, $options: "i" }
    }).sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance found for this class" });
    }

    // Track overall stats per student
    const studentStats = {};

    // Format date-wise data
    const dateWise = attendanceRecords.map(record => {
      return {
        date: record.date.toISOString().split("T")[0],
        classSection: record.classSection,
        students: record.students.map(s => {
          const id = s.studentId.toString();

          if (!studentStats[id]) {
            studentStats[id] = {
              studentId: id,
              studentName: s.studentName,
              rollNumber: s.rollNumber || "",
              classSection: record.classSection,
              total: 0,
              present: 0
            };
          }

          studentStats[id].total += 1;
          if (s.status === "Present") {
            studentStats[id].present += 1;
          }

          return {
            studentId: id,
            studentName: s.studentName,
            rollNumber: s.rollNumber || "",
            classSection: record.classSection,
            status: s.status
          };
        })
      };
    });

    // Convert studentStats to array with % calculation
    const overallStats = Object.values(studentStats).map(s => ({
      studentId: s.studentId,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      classSection: s.classSection,
      attendancePercentage: s.total > 0
        ? ((s.present / s.total) * 100).toFixed(2)
        : "0.00"
    }));

    res.status(200).json({
      dateWise,       // For table view
      overallStats    // For overall % per student
    });

  } catch (err) {
    console.error("Error fetching admin report:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};




// ✅ CLASSWISE DETAILED REPORT (date-wise + full details + overall %)
export const getAttendanceByClassName = async (req, res) => {
  try {
    const { className } = req.params; // e.g., "6"

    const attendanceRecords = await Attendance.find({
      classSection: { $regex: `^${className}`, $options: "i" }
    }).sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance found for this class" });
    }

    const studentStats = {};

    const dateWise = attendanceRecords.map(record => ({
      date: record.date.toISOString().split("T")[0],
      classSection: record.classSection,
      students: record.students.map(s => {
        const id = s.studentId.toString();

        if (!studentStats[id]) {
          studentStats[id] = {
            studentId: id,
            studentName: s.studentName,
            rollNumber: s.rollNumber || "",
            classSection: record.classSection,
            total: 0,
            present: 0
          };
        }

        studentStats[id].total += 1;
        if (s.status === "Present") studentStats[id].present += 1;

        return {
          studentId: id,
          studentName: s.studentName,
          rollNumber: s.rollNumber || "",
          classSection: record.classSection,
          status: s.status
        };
      })
    }));

    const overallStats = Object.values(studentStats).map(s => ({
      studentId: s.studentId,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      classSection: s.classSection,
      attendancePercentage:
        s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : "0.00"
    }));

    res.status(200).json({
      dateWise,
      overallStats
    });

  } catch (err) {
    console.error("Error fetching classwise attendance:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ SEND ABSENT SMS (Admin)
export const sendAbsentSMS = async (req, res) => {
  try {
    const { students, classSection, date } = req.body;
    const messages = [];

    for (const stu of students) {
      if (stu.fatherMobile) {
        messages.push({
          mobile: stu.fatherMobile,
          message: `Dear Parent, your ward ${stu.name} (Roll No: ${stu.rollNo}) was absent on ${date} in class ${classSection}.`,
        });
      }
    }

    if (messages.length > 0) {
      await sendBulkSMS(messages);
    }

    res.status(200).json({ message: "SMS sent successfully", count: messages.length });
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
