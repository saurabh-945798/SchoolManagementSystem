import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateMessage = () => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "all",
    className: "",
    section: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, content, audience, className, section } = form;

    if (!title.trim() || !content.trim()) {
      return toast.error("Please fill in all required fields.");
    }

    if (audience === "class" && (!className.trim() || !section.trim())) {
      return toast.error("Please select class and section.");
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return toast.error("Token missing. Please login again.");

      const res = await axios.post(
        "http://localhost:5000/api/messages/admin/create", // ✅ Correct route
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Message sent successfully");
      setForm({
        title: "",
        content: "",
        audience: "all",
        className: "",
        section: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        📨 Create New Message
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded shadow"
      >
        {/* Title */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-indigo-500"
            placeholder="Enter message title"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded px-3 py-2 focus:outline-indigo-500"
            placeholder="Enter your message..."
          />
        </div>

        {/* Audience */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Audience <span className="text-red-500">*</span>
          </label>
          <select
            name="audience"
            value={form.audience}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">All Students</option>
            <option value="class">Specific Class & Section</option>
          </select>
        </div>

        {/* Class & Section if selected */}
        {form.audience === "class" && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="className"
                value={form.className}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., 10"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., A"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          📤 Send Message
        </button>
      </form>
    </div>
  );
};

export default CreateMessage;
