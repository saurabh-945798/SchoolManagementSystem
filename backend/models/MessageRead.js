// models/MessageRead.js
import mongoose from "mongoose";

const messageReadSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  },
  { timestamps: true }
);

// Prevent duplicates: a student can read a message only once
messageReadSchema.index({ studentId: 1, messageId: 1 }, { unique: true });

export default mongoose.model("MessageRead", messageReadSchema);
