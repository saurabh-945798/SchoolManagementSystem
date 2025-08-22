import mongoose from 'mongoose';

const studentEntrySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  rollNo: String,
  status: { type: String, enum: ['Present', 'Absent'], required: true },
});

const attendanceSchema = new mongoose.Schema(
  {
    className: { type: String, required: true }, // e.g., "4"
    section: { type: String, required: true },   // e.g., "C"
    date: { type: Date, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    students: [studentEntrySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Attendance', attendanceSchema);
