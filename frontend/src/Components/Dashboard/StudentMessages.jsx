import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const backendURL = "http://localhost:5000";

const StudentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("studentToken");
  const student = JSON.parse(localStorage.getItem("studentData"));
  const className = student?.class;
  const section = student?.section;

  const axiosInstance = axios.create({
    baseURL: backendURL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/api/messages/student/${className}/${section}`);
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      } else if (Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-extrabold text-center text-indigo-700 mb-8 flex items-center justify-center gap-3"
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
        Class Announcements
      </motion.h2>

      {messages.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-500 text-lg"
        >
          📭 No messages found.
        </motion.p>
      ) : (
        <div className="grid gap-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-indigo-800">{msg.title}</h3>
                <span className="text-sm text-gray-400">
                  {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{msg.content}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <p className="text-gray-500 italic">
                  🧑‍🏫 Posted by: <span className="font-medium">{msg.postedBy}</span> ({msg.postedByRole})
                </p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    msg.audience === "all"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {msg.audience === "all"
                    ? "📣 For All Students"
                    : `📣 For ${msg.className}${msg.section}`}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMessages;
