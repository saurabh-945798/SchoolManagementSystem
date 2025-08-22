// utils/sendSMS.js
import axios from "axios";

const FAST2SMS_API_KEY = "pclsO8m63tBLTRbwHeW0IJCuxzFjVqErPaKgk5QX1UDSZv9Ao2VfN2hMG6bLtulxRO0wrZ5FePcUaHXJ";

export const sendBulkSMS = async (messages = []) => {
  if (!messages.length) return;

  // Group messages by unique content
  const groupedMessages = {};
  for (const msg of messages) {
    if (!groupedMessages[msg.message]) {
      groupedMessages[msg.message] = [];
    }
    groupedMessages[msg.message].push(msg.mobile);
  }

  for (const [text, numbers] of Object.entries(groupedMessages)) {
    try {
      const payload = {
        route: "v3",
        sender_id: "TXTIND", // ✅ Use approved sender_id in Fast2SMS dashboard
        message: text,
        language: "english",
        numbers: numbers.join(","),
      };

      const res = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
        headers: {
          authorization: FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ SMS sent:", res.data);
    } catch (err) {
      console.error("❌ SMS send error:", err.response?.data || err.message);
    }
  }
};
