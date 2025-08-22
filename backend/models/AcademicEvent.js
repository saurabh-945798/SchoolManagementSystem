import mongoose from "mongoose";

const academicEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ["exam", "ptm", "holiday", "event"],
    required: true,
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { timestamps: true });

// ✅ Correct default export
const AcademicEvent = mongoose.model("AcademicEvent", academicEventSchema);
export default AcademicEvent;
