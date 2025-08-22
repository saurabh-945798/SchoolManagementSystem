import Student from "../models/Student.js";

export const getSectionWiseStrength = async (req, res) => {
  try {
    const { classLevel } = req.params; // e.g., 10
    if (!classLevel) {
      return res.status(400).json({ message: "Class level is required" });
    }

    const students = await Student.aggregate([
      {
        $match: { class: classLevel }
      },
      {
        $group: {
          _id: "$section",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ sections: students });
  } catch (err) {
    console.error("❌ Error fetching section-wise strength:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
