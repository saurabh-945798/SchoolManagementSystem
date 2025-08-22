import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000";

const StudentFeeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("studentToken");
  const student = JSON.parse(localStorage.getItem("studentData"));

  const axiosInstance = axios.create({
    baseURL: backendURL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get(`/api/offline-fees/summary/${student._id}`);

      const { onlinePayments = [], offlinePayments = [] } = res.data;

      const allPayments = [
        ...onlinePayments.map((p) => ({
          _id: p._id,
          amountPaid: p.amountPaid,
          paymentType: p.paymentType || "online",
          razorpayPaymentId: p.razorpayPaymentId || "-",
          status: p.status,
          paidAt: p.paidAt,
          months: p.months || [],
          remark: p.remark || "",
          paymentMode: "Online",
        })),
        ...offlinePayments.map((p) => ({
          _id: p._id,
          amountPaid: p.amount,
          paymentType: "offline",
          razorpayPaymentId: "-",
          status: "success",
          paidAt: p.date,
          months: p.months || [],
          remark: p.remark || "",
          paymentMode: "Offline",
        })),
      ].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

      setHistory(allPayments);
    } catch (err) {
      console.error("❌ Error fetching fee history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Download Receipt Function
  const handleDownloadReceipt = (payment) => {
    const date = new Date(payment.paidAt).toLocaleDateString("en-GB");
    const months = payment.months?.join(", ") || "-";
    const amount = payment.amountPaid || 0;

    const printContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt-container {
              display: flex;
              justify-content: space-between;
              border: 1px dashed #000;
              padding: 10px;
            }
            .receipt {
              width: 48%;
              border: 1px solid #000;
              padding: 8px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 5px;
            }
            .header h2 { margin: 0; font-size: 14px; }
            .particulars {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              font-size: 12px;
            }
            .particulars th, .particulars td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
            }
            .signature {
              margin-top: 20px;
              text-align: right;
              font-size: 12px;
            }
            .copy-label {
              font-size: 10px;
              text-align: right;
              margin-top: -10px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Office Copy -->
            <div class="receipt">
              <div class="header">
                <h2>ST. PAUL'S SR. SECONDARY SCHOOL</h2>
                <p>(Affiliated to CBSE, New Delhi)<br/>
                Chandrapuri Colony, Mathura (U.P.)<br/>
                Mob: 9837971819, 8477010719<br/>
                Fee Receipt 2025-2026</p>
              </div>
              <div class="copy-label">Office Copy</div>
              <p><b>Admission No:</b> ${student.rollNumber || "-"} &nbsp;&nbsp; <b>Date:</b> ${date}</p>
              <p><b>Name:</b> ${student.name || "-"} &nbsp;&nbsp; <b>Class:</b> ${student.class}-${student.section}</p>
              <p><b>Father's Name:</b> ${student.fatherName || "-"} </p>
              <p><b>Receipt No:</b> ${payment._id || "-"} &nbsp;&nbsp; <b>Install:</b> ${months}</p>
              <table class="particulars">
                <tr><th>PARTICULARS</th><th>Amount</th></tr>
                <tr><td>Composite Fees</td><td>${amount}</td></tr>
                <tr><td>Calculated Fee</td><td>${amount}</td></tr>
                <tr><td>Net Payable</td><td>${amount}</td></tr>
              </table>
              <p><b>Total Paid By ${payment.paymentMode}:</b> ${amount}</p>
              <p><b>(In Words)</b> ${numberToWords(amount)} </p>
              <p><b>Remark:</b> ${payment.remark || ""}</p>
              <div class="signature">(Signature)</div>
            </div>

            <!-- Student Copy -->
            <div class="receipt">
              <div class="header">
                <h2>ST. PAUL'S SR. SECONDARY SCHOOL</h2>
                <p>(Affiliated to CBSE, New Delhi)<br/>
                Chandrapuri Colony, Mathura (U.P.)<br/>
                Mob: 9837971819, 8477010719<br/>
                Fee Receipt 2025-2026</p>
              </div>
              <div class="copy-label">Student Copy</div>
              <p><b>Admission No:</b> ${student.rollNumber || "-"} &nbsp;&nbsp; <b>Date:</b> ${date}</p>
              <p><b>Name:</b> ${student.name || "-"} &nbsp;&nbsp; <b>Class:</b> ${student.class}-${student.section}</p>
              <p><b>Father's Name:</b> ${student.fatherName || "-"} </p>
              <p><b>Receipt No:</b> ${payment._id || "-"} &nbsp;&nbsp; <b>Install:</b> ${months}</p>
              <table class="particulars">
                <tr><th>PARTICULARS</th><th>Amount</th></tr>
                <tr><td>Composite Fees</td><td>${amount}</td></tr>
                <tr><td>Calculated Fee</td><td>${amount}</td></tr>
                <tr><td>Net Payable</td><td>${amount}</td></tr>
              </table>
              <p><b>Total Paid By ${payment.paymentMode}:</b> ${amount}</p>
              <p><b>(In Words)</b> ${numberToWords(amount)} </p>
              <p><b>Remark:</b> ${payment.remark || ""}</p>
              <div class="signature">(Signature)</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(printContent);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  // 🔹 Convert number to words
  function numberToWords(num) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
               "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", 
               "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if ((num = num.toString()).length > 9) return "Overflow";
    const n = ("000000000" + num).substr(-9).match(/(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})/);
    if (!n) return; 
    let str = "";
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
    str += n[5] != 0 ? ((str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])) + " " : "";
    return str.trim();
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 mt-6 sm:mt-10 mb-10 sm:mb-16">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-indigo-700 font-inter tracking-wide">
          💳 Payment History
        </h2>

        {history.length === 0 ? (
          <p className="text-center text-gray-500 text-sm sm:text-lg">
            No payment history available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm text-left border border-gray-200">
              <thead className="bg-indigo-50 text-gray-700 uppercase text-[10px] sm:text-xs tracking-wider">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Date</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Amount</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Type</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Payment ID</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-700">
                {history.map((entry, idx) => (
                  <tr
                    key={entry._id}
                    className={`hover:bg-indigo-50 transition duration-200 border-t ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium whitespace-nowrap">
                      {new Date(entry.paidAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-indigo-700 font-semibold whitespace-nowrap">
                      ₹{entry.amountPaid}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full capitalize ${
                        entry.paymentType === "offline"
                          ? "bg-green-100 text-green-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {entry.paymentType}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-500 text-[10px] sm:text-xs break-all max-w-[120px] sm:max-w-[200px]">
                      {entry.razorpayPaymentId || "-"}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {entry.status === "success" ? (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] sm:text-xs font-semibold leading-4 text-green-800 bg-green-100 rounded-full">
                          ✅ Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] sm:text-xs font-semibold leading-4 text-red-800 bg-red-100 rounded-full">
                          ❌ Failed
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      {entry.status === "success" && (
                        <button
                          onClick={() => handleDownloadReceipt(entry)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
                        >
                          ⬇️ Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeHistory;
