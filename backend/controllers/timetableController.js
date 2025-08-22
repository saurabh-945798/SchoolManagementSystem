import Timetable from "../models/Timetable.js";
import Student from "../models/Student.js"; // 👈 Student model import

// Create timetable
export const createTimetable = async (req, res) => {
  try {
    const { class: classNum, section, days } = req.body;
    if (!classNum || !section) {
      return res.status(400).json({ message: "class and section are required" });
    }
    const existing = await Timetable.findOne({ class: classNum, section });
    if (existing) {
      return res.status(400).json({ message: "Timetable already exists for this class & section" });
    }
    const tt = new Timetable({ class: classNum, section, days: days || [] });
    await tt.save();
    res.status(201).json(tt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get timetable for a class & section
export const getClassTimetable = async (req, res) => {
  try {
    const { classNum, section } = req.params;
    const tt = await Timetable.findOne({ class: classNum, section });
    if (!tt) return res.status(404).json({ message: "Timetable not found" });
    res.json(tt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get timetable for specific day
export const getClassTimetableDay = async (req, res) => {
  try {
    const { classNum, section } = req.params;
    const { day } = req.query;
    const tt = await Timetable.findOne({ class: classNum, section });
    if (!tt) return res.status(404).json({ message: "Timetable not found" });

    if (day) {
      const dayEntry = tt.days.find(d => d.day.toLowerCase() === day.toLowerCase());
      if (!dayEntry) return res.status(404).json({ message: "Day not found" });
      return res.json(dayEntry);
    }
    res.json(tt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get timetable for logged-in student (NEW)
export const getStudentTimetable = async (req, res) => {
  try {
    // verifyToken middleware se student ka ID aayega
    const studentId = req.user.id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const timetable = await Timetable.findOne({
      class: student.class,
      section: student.section
    });

    if (!timetable) {
      return res.status(404).json({ message: "No timetable found for your class & section" });
    }

    res.status(200).json(timetable);
  } catch (error) {
    console.error("Error fetching student timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update full timetable by ID
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Timetable.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Timetable not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update specific period
export const updatePeriod = async (req, res) => {
  try {
    const { classNum, section, day, periodNumber } = req.params;
    const updates = req.body;

    console.log("Received Params:", { classNum, section, day, periodNumber });
    console.log("Request Body:", updates);

    const tt = await Timetable.findOne({ class: classNum, section });
    if (!tt) {
      console.log(`Timetable not found for class: ${classNum}, section: ${section}`);
      return res.status(404).json({ message: "Timetable not found" });
    }

    console.log("Found Timetable ID:", tt._id);

    const dayEntry = tt.days.find(d => d.day.toLowerCase() === day.toLowerCase());
    if (!dayEntry) {
      console.log(`Day '${day}' not found in timetable.days`);
      return res.status(404).json({ message: "Day not found" });
    }

    console.log("Found Day:", dayEntry.day);

    const period = dayEntry.periods.find(p => Number(p.periodNumber) === Number(periodNumber));
    if (!period) {
      console.log(`Period number ${periodNumber} not found in day periods`);
      return res.status(404).json({ message: "Period not found" });
    }

    console.log("Found Period:", period);

    const allowedFields = ["periodNumber", "subject", "startTime", "endTime"];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) period[field] = updates[field];
    });

    await tt.save();
    console.log("Timetable updated and saved");
    res.json(tt);
  } catch (err) {
    console.error("Error in updatePeriod:", err);
    res.status(500).json({ message: err.message });
  }
};


// Delete timetable by ID
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: "Timetable deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add period (by class & section)
export const addPeriod = async (req, res) => {
  try {
    const { classNum, section, day } = req.params;
    let { periodNumber, subject, startTime, endTime } = req.body;

    periodNumber = Number(periodNumber);

    if (!day || isNaN(periodNumber) || !subject) {
      return res.status(400).json({ message: "day, valid periodNumber, and subject are required" });
    }

    const timetable = await Timetable.findOne({ class: classNum, section });
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    let dayEntry = timetable.days.find(
      d => d.day.toLowerCase() === day.toLowerCase()
    );
    if (!dayEntry) {
      dayEntry = { day, periods: [] };
      timetable.days.push(dayEntry);
    }

    if (dayEntry.periods.some(p => Number(p.periodNumber) === periodNumber)) {
      return res.status(400).json({ message: "Period number already exists for this day" });
    }

    dayEntry.periods.push({
      periodNumber,
      subject,
      startTime,
      endTime
    });

    await timetable.save();
    res.status(200).json({ message: "Period added successfully", timetable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove period
export const removePeriod = async (req, res) => {
  try {
    const { classNum, section, day, periodNumber } = req.params;

    const tt = await Timetable.findOne({ class: classNum, section });
    if (!tt) return res.status(404).json({ message: "Timetable not found" });

    const dayEntry = tt.days.find(d => d.day.toLowerCase() === day.toLowerCase());
    if (!dayEntry) return res.status(404).json({ message: "Day not found" });

    const before = dayEntry.periods.length;
    dayEntry.periods = dayEntry.periods.filter(p => Number(p.periodNumber) !== Number(periodNumber));

    if (dayEntry.periods.length === before) {
      return res.status(404).json({ message: "Period not found" });
    }

    await tt.save();
    res.json(tt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all timetables
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.status(200).json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete timetable by class & section
export const deleteClassTimetable = async (req, res) => {
  try {
    const { classNum, section } = req.params;
    const deleted = await Timetable.findOneAndDelete({ class: classNum, section });
    if (!deleted) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: `Timetable for Class ${classNum} ${section} deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a period directly by timetable ID
export const addPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    let { day, periodNumber, subject, startTime, endTime } = req.body;

    periodNumber = Number(periodNumber);

    if (!day || isNaN(periodNumber) || !subject) {
      return res.status(400).json({ message: "day, valid periodNumber, and subject are required" });
    }

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    let dayEntry = timetable.days.find(
      d => d.day.toLowerCase() === day.toLowerCase()
    );
    if (!dayEntry) {
      dayEntry = { day, periods: [] };
      timetable.days.push(dayEntry);
    }

    if (dayEntry.periods.some(p => Number(p.periodNumber) === periodNumber)) {
      return res.status(400).json({ message: "Period number already exists for this day" });
    }

    dayEntry.periods.push({
      periodNumber,
      subject,
      startTime,
      endTime
    });

    await timetable.save();
    res.status(200).json({ message: "Period added successfully", timetable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
