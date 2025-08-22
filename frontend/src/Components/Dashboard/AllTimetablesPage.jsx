import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiTrash, FiChevronDown, FiChevronUp } from "react-icons/fi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function EmptyState({ children }) {
  return (
    <div className="text-center text-gray-500 py-8 italic select-none">
      <div className="text-4xl mb-2 opacity-70">🗂️</div>
      <div className="max-w-xs mx-auto">{children}</div>
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function AllTimetablesPage() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCardId, setOpenCardId] = useState(null);
  const [activeDay, setActiveDay] = useState({});
  const [editModal, setEditModal] = useState(null);

  // Get admin token from localStorage
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchTimetables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/timetable", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTimetables(res.data || []);
      const defaults = {};
      (res.data || []).forEach((t) => {
        defaults[t._id] = DAYS[0];
      });
      setActiveDay(defaults);
    } catch (err) {
      console.error("Error fetching timetables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (card, day, periodNumber) => {
    if (!window.confirm("Delete this period?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `/api/timetable/class/${card.class}/${card.section}/${day}/${periodNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTimetables();
    } catch (err) {
      console.error("Error deleting period:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };
  

  const handleDeleteTimetable = async (card) => {
    if (!window.confirm(`Delete entire timetable for Class ${card.class} - Section ${card.section}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");  // <-- token yahan lena hai
  
      await axios.delete(`/api/timetable/class/${card.class}/${card.section}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTimetables();
    } catch (err) {
      console.error("Error deleting timetable:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };
  
  const handleEditSave = async (card, day, periodNumber, updated) => {
    try {
      await axios.put(
        `/api/timetable/class/${card.class}/${card.section}/${day}/${periodNumber}`,
        updated,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditModal(null);
      fetchTimetables();
    } catch (err) {
      console.error("Error updating period:", err);
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-600">Loading timetables…</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📅 All Timetables</h1>
        <div className="text-sm text-gray-500">Manage classes & sections</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {timetables.length === 0 && <EmptyState>No timetables found.</EmptyState>}

        {timetables.map((table) => {
          const cardOpen = openCardId === table._id;
          const currentDay = activeDay[table._id] || DAYS[0];
          const dayObj = (table.days || []).find((d) => d.day === currentDay) || { day: currentDay, periods: [] };

          return (
            <motion.div
              layout
              key={table._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white shadow-lg rounded-xl p-5 border border-gray-100 hover:shadow-2xl transition"
            >
              <div className="flex items-start justify-between gap-3">
                <CardHeader
                  title={`Class ${table.class} • Section ${table.section}`}
                  subtitle={`${(table.days || []).length} days`}
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOpenCardId(cardOpen ? null : table._id)}
                    className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-sm"
                    aria-label={cardOpen ? "Close" : "Open"}
                  >
                    {cardOpen ? <><FiChevronUp /> Close</> : <><FiChevronDown /> Open</>}
                  </button>
                  <button
                    onClick={() => handleDeleteTimetable(table)}
                    className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-2 text-sm"
                    aria-label="Delete timetable"
                  >
                    <FiTrash /> Delete All
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {cardOpen && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto", transition: { duration: 0.22 } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.16 } }}
                    className="mt-4"
                  >
                    {/* Day Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
                      {DAYS.map((d) => {
                        const isActive = currentDay === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setActiveDay((s) => ({ ...s, [table._id]: d }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${isActive ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>

                    {/* Periods */}
                    <div className="rounded-lg overflow-hidden border">
                      <div className="bg-gradient-to-r from-gray-50 to-white p-3 flex items-center justify-between">
                        <div className="font-medium">Periods — {dayObj.day}</div>
                        <div className="text-sm text-gray-500">Total: {dayObj.periods?.length || 0}</div>
                      </div>

                      <div className="p-4">
                        {(!dayObj.periods || dayObj.periods.length === 0) ? (
                          <EmptyState>No periods scheduled for this day.</EmptyState>
                        ) : (
                          <div className="space-y-3">
                            {dayObj.periods.map((p) => (
                              <motion.div
                                key={p.periodNumber}
                                layout
                                whileHover={{ scale: 1.01 }}
                                className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                                    {p.periodNumber}
                                  </div>
                                  <div>
                                    <div className="font-medium">{p.subject}</div>
                                    <div className="text-sm text-gray-500">{p.startTime} - {p.endTime}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditModal({ card: table, day: dayObj.day, period: p })}
                                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded"
                                    aria-label="Edit period"
                                  >
                                    <FiEdit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(table, dayObj.day, p.periodNumber)}
                                    className="text-red-600 hover:text-red-800 p-2 rounded"
                                    aria-label="Delete period"
                                  >
                                    <FiTrash size={18} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ y: 30, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.98 }}
              className="bg-white rounded-xl w-full max-w-md p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Edit Period</h3>
                <button onClick={() => setEditModal(null)} className="text-gray-500">Close</button>
              </div>

              <EditForm
                initial={editModal.period}
                onCancel={() => setEditModal(null)}
                onSave={(updated) => handleEditSave(editModal.card, editModal.day, editModal.period.periodNumber, updated)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState({
    subject: initial.subject || "",
    startTime: initial.startTime || "",
    endTime: initial.endTime || ""
  });

  useEffect(() => {
    setForm({
      subject: initial.subject || "",
      startTime: initial.startTime || "",
      endTime: initial.endTime || ""
    });
  }, [initial]);

  return (
    <div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Subject</label>
          <input
            value={form.subject}
            onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
            className="mt-1 w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Start</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
              className="mt-1 w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium">End</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
              className="mt-1 w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
      </div>
    </div>
  );
}
