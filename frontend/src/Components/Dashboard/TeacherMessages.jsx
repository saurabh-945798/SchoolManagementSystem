import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TeacherMessageForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [classInput, setClassInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !classInput) {
      toast.error("Please fill all fields");
      return;
    }

    // ✅ Extract className and section from manual input like "7A"
    const match = classInput.trim().toUpperCase().match(/^(\d{1,2})([A-Z])$/);
    if (!match) {
      toast.error("Invalid class format. Use format like 7A.");
      return;
    }

    const className = match[1];
    const section = match[2];

    try {
      const token = localStorage.getItem("teacherToken");

      await axios.post(
        "http://localhost:5000/api/messages/teacher/create",
        {
          title,
          content,
          audience: "class",
          className,
          section,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ Message sent successfully!");
      setTitle("");
      setContent("");
      setClassInput("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to send message");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow font-poppins">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">
        📨 Post a Message to Class
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Message Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Enter your message"
          className="w-full border p-2 rounded h-28 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="text"
          placeholder="Class (e.g., 7A)"
          className="w-full border p-2 rounded"
          value={classInput}
          onChange={(e) => setClassInput(e.target.value)}
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full transition"
        >
          📤 Send Message
        </button>
      </form>
    </div>
  );
};

export default TeacherMessageForm;
