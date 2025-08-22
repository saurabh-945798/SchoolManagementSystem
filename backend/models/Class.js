import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String, // e.g., "7"
    required: true
  },
  section: {
    type: String, // e.g., "C"
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, { timestamps: true });

// ✅ Prevent duplicates: no two same name-section (e.g., 7A & 7A again)
classSchema.index({ name: 1, section: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
