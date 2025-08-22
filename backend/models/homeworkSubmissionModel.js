import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homework",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Submitted", "Checked"],
      default: "Submitted",
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);
