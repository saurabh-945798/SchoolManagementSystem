import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
  {
    classLevel: {
      type: Number, // e.g., 6, 7, 8
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String, // optional - for uploading PDF/image links
    },
    dueDate: {
      type: Date,
    },
    uploadedBy: {
      type: String, // admin email or ID
    },
  },
  { timestamps: true }
);

export default mongoose.model("Homework", homeworkSchema);
