import React, { useState } from "react";
import axios from "axios";

const AdminHomeworkUploader = () => {
  const [formData, setFormData] = useState({
    classLevel: "",
    subject: "",
    title: "",
    description: "",
    dueDate: "",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !formData.classLevel || !formData.subject || !formData.title) {
      return alert("Please fill all required fields and upload a file.");
    }

    const payload = new FormData();
    payload.append("classLevel", formData.classLevel);
    payload.append("subject", formData.subject);
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("dueDate", formData.dueDate);
    payload.append("file", file);

    setSubmitting(true);

    try {
      await axios.post("/api/homework", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Homework uploaded successfully");
      setFormData({
        classLevel: "",
        subject: "",
        title: "",
        description: "",
        dueDate: "",
      });
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📘 Upload Holiday Homework</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-semibold">Class Level *</label>
          <input
            type="number"
            name="classLevel"
            value={formData.classLevel}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
            placeholder="e.g. 6"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
            placeholder="e.g. English"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
            placeholder="e.g. Holiday Essay Writing"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-semibold">Due Date (optional)</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Upload PDF *</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Uploading..." : "Upload Homework"}
        </button>
      </form>
    </div>
  );
};

export default AdminHomeworkUploader;
