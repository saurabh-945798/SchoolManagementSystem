import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const AdminLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/leaves/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/leaves/admin/update/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const deleteLeave = async (id) => {
    try {
      await axios.delete(`/api/leaves/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Leave request deleted.");
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to delete leave request.");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <h2 className="text-3xl font-extrabold text-indigo-600 mb-6 flex items-center gap-2">
          📝 All Leave Requests
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="text-center text-gray-500">No leave requests found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-600 text-white text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Dates</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Certificate</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-indigo-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{leave.studentName}</div>
                        <div className="text-xs text-gray-500">{leave.rollNo}</div>
                      </td>
                      <td className="px-4 py-3">{leave.className}</td>
                      <td className="px-4 py-3 capitalize">{leave.leaveType}</td>
                      <td className="px-4 py-3">
                        {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{leave.reason}</td>
                      <td className="px-4 py-3">
                        {leave.certificateUrl ? (
                          <div className="flex flex-col gap-1">
                            <a
                              href={`http://localhost:5000${leave.certificateUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={`http://localhost:5000${leave.certificateUrl}`}
                              download
                              className="text-sm text-green-600 hover:underline"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            leave.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : leave.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {leave.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(leave._id, "approved")}
                                className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full"
                                title="Approve"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(leave._id, "rejected")}
                                className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full"
                                title="Reject"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteLeave(leave._id)}
                            className="bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 p-2 rounded-full"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden flex flex-col gap-4">
              {leaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white rounded-xl p-4 shadow border space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{leave.studentName}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        leave.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{leave.rollNo}</div>
                  <div className="text-sm">
                    <strong>Class:</strong> {leave.className}
                  </div>
                  <div className="text-sm">
                    <strong>Type:</strong> {leave.leaveType}
                  </div>
                  <div className="text-sm">
                    <strong>Dates:</strong>{" "}
                    {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                    {new Date(leave.toDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <strong>Reason:</strong> {leave.reason}
                  </div>
                  {leave.certificateUrl && (
                    <div className="text-sm">
                      <a
                        href={`http://localhost:5000${leave.certificateUrl}`}
                        target="_blank"
                        className="text-indigo-600 underline mr-3"
                      >
                        View
                      </a>
                      <a
                        href={`http://localhost:5000${leave.certificateUrl}`}
                        download
                        className="text-green-600 underline"
                      >
                        Download
                      </a>
                    </div>
                  )}
                  <div className="flex gap-3 mt-2">
                    {leave.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(leave._id, "approved")}
                          className="text-green-600"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(leave._id, "rejected")}
                          className="text-red-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteLeave(leave._id)}
                      className="text-gray-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLeaveManager;
