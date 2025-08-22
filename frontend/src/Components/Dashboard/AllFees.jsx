import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const AllFees = () => {
  const [fees, setFees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/fees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch fees");
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/fees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Fee deleted successfully!");
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete fee");
    }
  };

  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:5000/api/fees/${id}`,
        { amount: Number(editAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Fee updated successfully!");
      setEditingId(null);
      setEditAmount("");
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update fee");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
          📋 Manage All Class Fees
        </h2>

        <table className="w-full table-auto border-collapse rounded-md overflow-hidden">
          <thead className="bg-indigo-100 text-indigo-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Class</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount (₹)</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr
                key={fee._id}
                className="border-t border-gray-200 hover:bg-indigo-50 transition"
              >
                <td className="px-6 py-3 font-medium text-gray-700">{fee.className}</td>
                <td className="px-6 py-3">
                  {editingId === fee._id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="border px-3 py-2 rounded w-28 focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-gray-800 font-semibold">₹{fee.amount}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center space-x-2">
                  {editingId === fee._id ? (
                    <>
                      <button
                        onClick={() => handleEdit(fee._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded  items-center gap-1 inline-flex"
                      >
                        <CheckIcon className="h-4 w-4" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditAmount("");
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded  items-center gap-1 inline-flex"
                      >
                        <XMarkIcon className="h-4 w-4" /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(fee._id);
                          setEditAmount(fee.amount);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded  items-center gap-1 inline-flex"
                      >
                        <PencilIcon className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fee._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded  items-center gap-1 inline-flex"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {fees.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  <span className="text-2xl">📭</span>
                  <p className="mt-2">No fee records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllFees;
