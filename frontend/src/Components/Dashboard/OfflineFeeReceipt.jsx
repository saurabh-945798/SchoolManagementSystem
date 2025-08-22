// src/pages/OfflineFeeReceipt.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OfflineFeeReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, payment } = location.state || {};

  if (!student || !payment) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No Receipt Data Found!</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const date = new Date(payment.date).toLocaleDateString("en-GB");
  const months = payment.months?.join(", ") || "-";
  const amount = payment.amount || 0;

  const numberToWords = (num) => {
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

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      <div className="bg-white shadow-lg p-6 rounded-lg border border-gray-300">
        <h1 className="text-2xl font-bold text-center mb-4">ST. PAUL'S SR. SECONDARY SCHOOL</h1>
        <p className="text-center mb-2">(Affiliated to CBSE, New Delhi)</p>
        <p className="text-center mb-4">Chandrapuri Colony, Mathura (U.P.) | Mob: 9837971819, 8477010719</p>

        <hr className="my-4 border-dashed border-gray-400" />

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <p><strong>Admission No:</strong> {student.rollNumber}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Class:</strong> {student.class}-{student.section}</p>
          <p><strong>Father's Name:</strong> {student.fatherName}</p>
          <p><strong>Receipt No:</strong> {payment._id}</p>
          <p><strong>Months Paid:</strong> {months}</p>
          <p><strong>Payment Mode:</strong> {payment.paymentMode}</p>
        </div>

        <table className="w-full border border-gray-400 border-collapse text-sm mb-4">
          <thead>
            <tr>
              <th className="border px-2 py-1">Particulars</th>
              <th className="border px-2 py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Composite Fees</td>
              <td className="border px-2 py-1">₹{amount}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Net Payable</td>
              <td className="border px-2 py-1">₹{amount}</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-2"><strong>Amount in Words:</strong> {numberToWords(amount)}</p>
        <p className="mb-2"><strong>Cashier:</strong> {payment.cashier}</p>
        {payment.remark && <p className="mb-2"><strong>Remark:</strong> {payment.remark}</p>}

        <div className="text-right mt-6 font-semibold">(Signature)</div>

        <button
          onClick={() => window.print()}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OfflineFeeReceipt; 
