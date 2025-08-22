import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true }, // ✅ Add this
  class: { type: String, required: true },
  section: { type: String, required: true },
  dob: { type: Date, required: true },
  rollNumber: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  studentPhone: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  fatherPhone: { type: String, required: true },
  motherPhone: { type: String, required: true },
  fatherOccupation: { type: String },
  motherOccupation: { type: String },
}, {
  timestamps: true,
});

export default mongoose.model('Student', studentSchema);
