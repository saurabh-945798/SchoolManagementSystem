import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  subject: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String }
}, { _id: false });

const DaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  periods: { type: [PeriodSchema], default: [] }
}, { _id: false });

const TimetableSchema = new mongoose.Schema({
  class: { type: String, required: true },  // e.g. "7"
  section: { type: String, required: true }, // e.g. "A"
  days: { type: [DaySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TimetableSchema.index({ class: 1, section: 1 }, { unique: true });

TimetableSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Timetable", TimetableSchema);
