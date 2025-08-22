import AcademicEvent from "../models/AcademicEvent.js";

// 📌 Create new academic event
export const createEvent = async (req, res) => {
  try {
    const { title, description, type, start, end } = req.body;

    if (!title || !type || !start || !end) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const event = await AcademicEvent.create({
      title,
      description,
      type: type.toLowerCase(),
      start,
      end,
    });

    res.status(201).json({ success: true, message: "Event created", event });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: err.message,
    });
  }
};

// 📌 Get all events (for student and admin)
export const getAllEvents = async (req, res) => {
  try {
    const events = await AcademicEvent.find().sort({ start: 1 });

    // Important: send plain array, not wrapped in success object
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: err.message,
    });
  }
};

// 📌 Update an event (admin only)
export const updateEvent = async (req, res) => {
  try {
    const { title, description, type, start, end } = req.body;

    const updated = await AcademicEvent.findByIdAndUpdate(
      req.params.id,
      { title, description, type, start, end },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Event updated", updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

// 📌 Delete an event (admin only)
export const deleteEvent = async (req, res) => {
  try {
    await AcademicEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};
