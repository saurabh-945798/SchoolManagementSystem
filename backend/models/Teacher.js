import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date },

    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },

    password: { type: String, required: true },
    photoUrl: { type: String, default: '' },

    teacherID: { type: String, unique: true },
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    subjects: [{ type: String }],

    classesAssigned: {
      type: [String],
      default: [],
    },

    department: { type: String, default: '' },
    joiningDate: { type: Date },
    teacherType: {
      type: String,
      enum: ['PGT', 'TGT', 'Assistant', ''],
      default: '',
    },

    role: { type: String, default: 'teacher' },
  },
  { timestamps: true }
);

export default mongoose.model('Teacher', teacherSchema);
