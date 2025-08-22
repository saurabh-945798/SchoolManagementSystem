import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    className: { type: String, required: true }, // e.g., "10", "12"
    name: { type: String, required: true },      // e.g., "Math", "Physics"
  },
  { timestamps: true }
);

subjectSchema.index({ className: 1, name: 1 }, { unique: true }); // prevent duplicate subjects in same class

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
