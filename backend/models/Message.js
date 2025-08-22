import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, enum: ["all", "class"], default: "all" },
    className: { type: String, default: null },
    section: { type: String, default: null },
    date: { type: Date, default: Date.now },
    postedBy: { type: String, default: "Admin" },
    postedByRole: { type: String, enum: ["admin", "teacher"], default: "admin" }, // ✅ Added role info
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
