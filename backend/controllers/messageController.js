import Message from "../models/Message.js";
import MessageRead from "../models/MessageRead.js";

// 📨 Admin or Teacher creates message
export const createMessage = async (req, res) => {
  try {
    const { title, content, audience, className, section } = req.body;
    const { role, email } = req.user;

    if (!title?.trim() || !content?.trim() || !audience) {
      return res.status(400).json({ message: "Title, content, and audience are required." });
    }

    if (audience === "class" && (!className || !section)) {
      return res.status(400).json({ message: "Class and section are required for class-targeted messages." });
    }

    if (role === "teacher") {
      const Teacher = (await import("../models/Teacher.js")).default;
      const teacher = await Teacher.findOne({ email });
      const fullClass = `${className}${section.toUpperCase()}`;

      if (!teacher || !teacher.assignedClasses.includes(fullClass)) {
        return res.status(403).json({
          message: `You are not authorized to send messages to class ${fullClass}`,
        });
      }
    }

    const message = await Message.create({
      title: title.trim(),
      content: content.trim(),
      audience,
      className: audience === "class" ? className : null,
      section: audience === "class" ? section.toUpperCase() : null,
      date: new Date(),
      postedBy: email || "Unknown",
      postedByRole: role || "admin",
    });

    res.status(201).json({ message: "✅ Message created", data: message });
  } catch (err) {
    console.error("❌ Error creating message:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📤 Students fetch messages + unread count
export const getMessagesForStudent = async (req, res) => {
  try {
    const { className, section } = req.params;
    const studentId = req.user._id;

    const messages = await Message.find({
      $or: [
        { audience: "all" },
        { audience: "class", className, section },
      ],
    }).sort({ createdAt: -1 });

    const readMessages = await MessageRead.find({ studentId }).distinct("messageId");

    const unreadMessages = messages.filter(msg => !readMessages.includes(msg._id.toString()));

    res.status(200).json({
      unreadCount: unreadMessages.length,
      messages,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};

// ✅ Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { messageId } = req.body;

    await MessageRead.updateOne(
      { studentId, messageId },
      { $setOnInsert: { studentId, messageId } },
      { upsert: true }
    );

    res.status(200).json({ message: "✅ Message marked as read" });
  } catch (err) {
    console.error("❌ Error marking message read:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 Admin fetches all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ count: messages.length, data: messages });
  } catch (err) {
    console.error("❌ Error fetching all messages:", err);
    res.status(500).json({ message: "Error fetching all messages", error: err.message });
  }
};
