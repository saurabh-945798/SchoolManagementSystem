// src/Components/Dashboard/AllMessages.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Loader } from 'lucide-react';

const AllMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // ✅ Use admin token

      if (!token) {
        console.error('❌ No token found. Please login again.');
        return;
      }

      const res = await axios.get('/api/messages/admin/all', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Attach token to header
        },
      });

      if (res.data?.data) {
        setMessages(res.data.data);
      } else {
        console.error('❌ Unexpected data format:', res.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-3">
          <ChatBubbleLeftIcon className="w-6 h-6" />
          All Messages
        </h1>
        <p className="text-gray-600 mt-1">View all announcements sent by the admin</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin w-6 h-6 text-indigo-500" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No messages found.</p>
      ) : (
        <div className="grid gap-6">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{msg.title}</h2>
                <span className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-gray-700 text-sm mb-3">{msg.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>
                  👥 Audience:{' '}
                  <span className="font-medium text-indigo-600">
                    {msg.audience === 'all'
                      ? 'All Students'
                      : `${msg.className}-${msg.section}`}
                  </span>
                </span>
                {msg.postedBy && <span>📤 Posted By: {msg.postedBy}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMessages;
