import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
});

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentRoll: { type: String, required: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    term: { type: String, required: true },
    year: { type: Number, required: true },
    subjects: [subjectSchema],
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
  },
  { timestamps: true }
);

// 💡 Prevent duplicate results per student + term + year
resultSchema.index({ student: 1, term: 1, year: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;
