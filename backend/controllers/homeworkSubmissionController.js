import HomeworkSubmission from "../models/homeworkSubmissionModel.js";

// 🧑‍🎓 Student submits homework
export const submitHomework = async (req, res) => {
  try {
    const { homeworkId, fileUrl } = req.body;
    const studentId = req.user._id;

    if (!homeworkId || !fileUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await HomeworkSubmission.findOne({ studentId, homeworkId });
    if (existing) {
      return res.status(409).json({ message: "Already submitted" });
    }

    const submission = new HomeworkSubmission({
      studentId,
      homeworkId,
      fileUrl,
    });

    await submission.save();
    res.status(201).json({ message: "Submitted successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Submission failed", error });
  }
};

// 🧑‍🏫 Admin views all submissions for one homework
export const getSubmissionsByHomeworkId = async (req, res) => {
  try {
    const homeworkId = req.params.homeworkId;

    const submissions = await HomeworkSubmission.find({ homeworkId })
      .populate("studentId", "name rollNo className section")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error });
  }
};

// ✅ Admin marks a submission as checked
export const markAsChecked = async (req, res) => {
  try {
    const id = req.params.id;
    const { remarks } = req.body;

    const submission = await HomeworkSubmission.findById(id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.status = "Checked";
    submission.remarks = remarks || "";
    await submission.save();

    res.status(200).json({ message: "Marked as checked", submission });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};
