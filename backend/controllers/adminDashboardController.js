import mongoose from 'mongoose';

export const getDashboardSummary = async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const Teacher = (await import('../models/Teacher.js')).default;
    const Fee = (await import('../models/Fee.js')).default;
    const StudentFeePayment = (await import('../models/StudentFeePayment.js')).default;
    const OfflineFee = (await import('../models/OfflineFee.js')).default;
    const Attendance = (await import('../models/Attendance.js')).default;

    // ✅ Basic Counts
    const [totalStudents, totalTeachers, boys, girls] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments({ gender: 'Male' }),
      Student.countDocuments({ gender: 'Female' }),
    ]);

    // ✅ Revenue (Online + Offline)
    const onlineRevenueAgg = await StudentFeePayment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);
    const onlineRevenue = onlineRevenueAgg[0]?.total || 0;

    const offlineRevenueAgg = await OfflineFee.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const offlineRevenue = offlineRevenueAgg[0]?.total || 0;

    const totalRevenue = onlineRevenue + offlineRevenue;

    // ✅ Fetch all needed data for further processing
    const [students, payments, offlinePayments, fees] = await Promise.all([
      Student.find(),
      StudentFeePayment.find({ status: "success" }),
      OfflineFee.find(),   // 🔹 Offline payment fetch
      Fee.find(),
    ]);

    // ✅ Class Fee Map
    const feeMap = {}; // e.g. "10" => 15000
    for (const fee of fees) {
      const classLevel = fee.className.replace(/[^\d]/g, ""); // "Class 10" -> "10"
      feeMap[classLevel] = fee.amount;
    }

    // ✅ Payment Map (studentId => totalPaid)
    const paymentMap = {};

    // 🔹 Online Payments
    for (const payment of payments) {
      const sid = payment.student?.toString();
      if (!paymentMap[sid]) paymentMap[sid] = 0;
      paymentMap[sid] += Number(payment.amountPaid || 0);
    }

    // 🔹 Offline Payments
    for (const payment of offlinePayments) {
      const sid = payment.student?.toString();
      if (!paymentMap[sid]) paymentMap[sid] = 0;
      paymentMap[sid] += Number(payment.amount || 0);
    }

    // ✅ Calculate totalExpectedFee per student
    let feeDefaultersCount = 0;
    let totalExpectedFee = 0;

    for (const student of students) {
      const rawClass = student.className || student.class;
      const classLevel = rawClass?.replace(/[^\d]/g, "") || "";
      const classFee = feeMap[classLevel] || 0;
      const studentId = student._id.toString();
      const paid = paymentMap[studentId] || 0;

      totalExpectedFee += classFee;

      if (paid < classFee) {
        feeDefaultersCount++;
      }
    }

    // ✅ Attendance Summary (Last 7 days)
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    const attendanceAggregation = await Attendance.aggregate([
      { $match: { date: { $gte: weekAgo, $lte: today } } },
      { $unwind: "$students" },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$students.status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const attendanceMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceMap[key] = { date: key, present: 0, absent: 0 };
    }

    attendanceAggregation.forEach(({ _id, count }) => {
      const { date, status } = _id;
      if (attendanceMap[date]) {
        if (status === "Present") attendanceMap[date].present += count;
        else if (status === "Absent") attendanceMap[date].absent += count;
      }
    });

    const weeklyAttendance = Object.values(attendanceMap);
    const presentCountWeekly = weeklyAttendance.reduce((sum, d) => sum + d.present, 0);
    const absentCountWeekly = weeklyAttendance.reduce((sum, d) => sum + d.absent, 0);

    // ✅ Final Response
    res.status(200).json({
      totalStudents,
      totalTeachers,
      boys,
      girls,
      totalRevenue,       // 🔹 Online + Offline dono
      onlineRevenue,
      offlineRevenue,
      totalExpectedFee,
      feeDefaultersCount, // 🔹 Ab dono payment sources include hote hain
      presentCountWeekly,
      absentCountWeekly,
      weeklyAttendance,
    });

  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
