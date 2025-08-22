// AdminCalendar.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import addDays from "date-fns/addDays";
import isSameDay from "date-fns/isSameDay";
import enUS from "date-fns/locale/en-US";
import axios from "axios";
import { toast } from "react-toastify";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCcw,
  FiFilter,
} from "react-icons/fi";
import { MdOutlineEventAvailable } from "react-icons/md";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Colors for event types (tweak as you like)
const eventColors = {
  exam: "#ef4444", // red
  ptm: "#f59e0b", // amber
  holiday: "#10b981", // green
  event: "#3b82f6", // blue
};

const TYPE_LABELS = {
  exam: "Exam",
  ptm: "PTM",
  holiday: "Holiday",
  event: "Event",
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "event",
    start: "",
    end: "",
  });

  // UI state
  const [filterTypes, setFilterTypes] = useState({
    exam: true,
    ptm: true,
    holiday: true,
    event: true,
  });
  const [searchText, setSearchText] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const token = localStorage.getItem("adminToken");

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/calendar/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = (res.data || []).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
      // Sort by start
      formatted.sort((a, b) => new Date(a.start) - new Date(b.start));
      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Error fetching events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ---------- Utility: open create modal for a slot ----------
  const openCreateModal = (slot) => {
    setSelectedSlot(slot);
    setSelectedEvent(null);
    setEditMode(false);

    // default start/end values in 'YYYY-MM-DDTHH:mm' format for input[type=datetime-local]
    const startISO = slot.start ? toInputDateTimeLocal(slot.start) : toInputDateTimeLocal(new Date());
    const endISO = slot.end ? toInputDateTimeLocal(slot.end) : toInputDateTimeLocal(addDays(new Date(), 1));

    setForm({
      title: "",
      description: "",
      type: "event",
      start: startISO,
      end: endISO,
    });
    setModalOpen(true);
  };

  // ---------- Utility: open edit modal for an event ----------
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setEditMode(true);

    setForm({
      title: event.title || "",
      description: event.description || "",
      type: event.type || "event",
      start: toInputDateTimeLocal(event.start),
      end: toInputDateTimeLocal(event.end),
    });
    setModalOpen(true);
  };

  // ---------- Submit (create or update) ----------
  const handleSubmit = async () => {
    if (!form.title || !form.type || !form.start || !form.end) {
      return toast.error("Please fill all required fields");
    }
    // prepare payload
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
    };

    try {
      if (editMode && selectedEvent) {
        await axios.put(`/api/calendar/admin/update/${selectedEvent._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated");
      } else {
        await axios.post("/api/calendar/admin/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event created");
      }
      setModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Create/update failed:", err);
      toast.error("Operation failed");
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await axios.delete(`/api/calendar/admin/delete/${selectedEvent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted");
      setModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete");
    }
  };

  // ---------- Helpers ----------
  function toInputDateTimeLocal(d) {
    if (!d) return "";
    const dt = new Date(d);
    // produce "YYYY-MM-DDTHH:mm"
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = dt.getFullYear();
    const MM = pad(dt.getMonth() + 1);
    const DD = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  }

  // filter + search events for calendar display
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => {
      if (!filterTypes[ev.type]) return false;
      if (!searchText) return true;
      const q = searchText.toLowerCase();
      return (ev.title || "").toLowerCase().includes(q) || (ev.description || "").toLowerCase().includes(q);
    });
  }, [events, filterTypes, searchText]);

  // style for events
  const eventStyleGetter = (event) => {
    const backgroundColor = eventColors[event.type] || "#6366f1";
    // highlight today's events slightly different
    const isToday = isSameDay(event.start, new Date());
    return {
      style: {
        backgroundColor,
        color: "#fff",
        borderRadius: 8,
        padding: "6px 8px",
        boxShadow: isToday ? "0 6px 18px rgba(99,102,241,0.14)" : "none",
        border: "none",
      },
    };
  };

  // custom event renderer (compact card)
  const EventComponent = ({ event }) => {
    return (
      <div className="text-xs font-medium leading-tight">
        <div className="truncate">{event.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-white/90 mt-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/20">{TYPE_LABELS[event.type] || event.type}</span>
          <span className="opacity-80">{format(event.start, "dd MMM")}</span>
        </div>
      </div>
    );
  };

  // Export CSV utility
  const exportCSV = () => {
    if (!events?.length) return toast.info("No events to export");
    const header = ["Title", "Type", "Start", "End", "Description"];
    const rows = events.map((e) => [
      escapeCsv(e.title || ""),
      escapeCsv(TYPE_LABELS[e.type] || e.type || ""),
      new Date(e.start).toISOString(),
      new Date(e.end).toISOString(),
      escapeCsv(e.description || ""),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar_events_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function escapeCsv(v) {
    if (!v && v !== 0) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  // quick utilities
  const refresh = () => setRefreshKey((k) => k + 1);
  const goToPrev = () => setViewDate((d) => addDays(d, -30));
  const goToNext = () => setViewDate((d) => addDays(d, 30));

  // ---------- Render ----------
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <MdOutlineEventAvailable className="w-8 h-8 text-indigo-600" />
              Academic Calendar
            </h2>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and manage school events — exams, PTMs, holidays & more.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalOpen(true);
                setEditMode(false);
                // default empty form with today -> today+1
                setForm({
                  title: "",
                  description: "",
                  type: "event",
                  start: toInputDateTimeLocal(new Date()),
                  end: toInputDateTimeLocal(addDays(new Date(), 1)),
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
            >
              <FiPlus /> Create
            </button>

            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:shadow">
              <FiDownload /> Export CSV
            </button>

            <button onClick={refresh} className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:shadow">
              <FiRefreshCcw /> Refresh
            </button>
          </div>
        </div>

        {/* Main layout: left controls + calendar area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left panel */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center gap-2">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search title / description..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
                <button onClick={() => setSearchText("")} className="px-2 py-2 text-gray-500">
                  Clear
                </button>
              </div>

              {/* Filters */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <FiFilter /> <span> Filters</span>
                  </div>
                  <button
                    onClick={() => setFilterTypes({ exam: true, ptm: true, holiday: true, event: true })}
                    className="text-indigo-600 text-xs"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(filterTypes).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterTypes((prev) => ({ ...prev, [t]: !prev[t] }))}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium ${
                        filterTypes[t] ? "bg-[rgba(59,130,246,0.12)]" : "bg-gray-50"
                      }`}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: eventColors[t] }} />
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 border-t pt-3 text-sm text-gray-600">
                <div className="font-medium text-gray-700 mb-2">Legend</div>
                <div className="space-y-2">
                  {Object.keys(eventColors).map((k) => (
                    <div key={k} className="flex items-center gap-3 text-xs">
                      <span style={{ background: eventColors[k] }} className="w-3 h-3 rounded-full inline-block" />
                      <div>
                        <div className="font-medium">{TYPE_LABELS[k]}</div>
                        <div className="text-gray-400 text-xs">Color: {eventColors[k]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming events list */}
            <div className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Upcoming</h4>
                <div className="text-xs text-gray-500">{events.length} total</div>
              </div>

              <div className="mt-3 space-y-3 max-h-60 overflow-auto">
                {events.length === 0 ? (
                  <div className="text-sm text-gray-400">No events yet</div>
                ) : (
                  events
                    .filter((e) => new Date(e.start) >= new Date())
                    .slice(0, 8)
                    .map((e) => (
                      <motion.div
                        key={e._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // focus calendar on event date and open edit
                          setViewDate(new Date(e.start));
                          openEditModal(e);
                        }}
                      >
                        <div style={{ background: eventColors[e.type] }} className="w-2 h-10 rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold line-clamp-1">{e.title}</div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(e.start), "dd MMM yyyy")} • {TYPE_LABELS[e.type]}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </motion.div>
                    ))
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-4 shadow space-y-2">
              <button
                onClick={() => {
                  setModalOpen(true);
                  setEditMode(false);
                  setForm({
                    title: "",
                    description: "",
                    type: "event",
                    start: toInputDateTimeLocal(new Date()),
                    end: toInputDateTimeLocal(addDays(new Date(), 1)),
                  });
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white"
              >
                <FiPlus /> New Event
              </button>
              {/* <button onClick={() => {
                // bulk delete example — careful in production (here just demo trigger)
                if (!window.confirm("Delete ALL events? This action is irreversible.")) return;
                // call admin endpoint if you have one for bulk delete OR iterate and delete each
                toast.info("Bulk delete not implemented in demo");
              }} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border">
                <FiTrash2 /> Bulk Delete
              </button> */}
            </div>
          </aside>

          {/* Calendar area */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow space-y-4">
              {/* toolbar: custom controls */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={goToPrev} className="p-2 rounded border"><FiChevronLeft /></button>
                  <button onClick={() => setViewDate(new Date())} className="px-3 py-2 bg-gray-100 rounded">Today</button>
                  <button onClick={goToNext} className="p-2 rounded border"><FiChevronRight /></button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 font-medium">{format(viewDate, "MMMM yyyy")}</div>
                  <div className="h-8 w-[1px] bg-gray-100" />
                  <select
                    value={localizer?.allowedViews?.default || Views.MONTH}
                    onChange={() => {}}
                    className="px-2 py-1 border rounded"
                    style={{ display: "none" }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { setSearchText(""); setFilterTypes({ exam: true, ptm: true, holiday: true, event: true }); }} className="px-3 py-2 border rounded">Reset</button>
                </div>
              </div>

              {/* Calendar itself */}
              <div style={{ height: "68vh" }}>
                <Calendar
                  localizer={localizer}
                  events={visibleEvents}
                  startAccessor="start"
                  endAccessor="end"
                  defaultView={Views.MONTH}
                  views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                  onSelectEvent={(e) => openEditModal(e)}
                  selectable
                  onSelectSlot={(slotInfo) => openCreateModal(slotInfo)}
                  components={{
                    event: EventComponent,
                  }}
                  eventPropGetter={eventStyleGetter}
                  date={viewDate}
                  onNavigate={(date) => setViewDate(date)}
                  popup
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ---------- Modal ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{editMode ? "Edit Event" : "Create Event"}</h3>
                <p className="text-sm text-gray-500 mt-1">{editMode ? "Modify or delete the selected event." : "Pick a slot on calendar or fill the form below."}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setModalOpen(false); setSelectedEvent(null); }} className="text-sm text-gray-500">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="mt-2 w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-2 w-full px-3 py-2 border rounded-lg">
                  <option value="exam">Exam</option>
                  <option value="ptm">PTM</option>
                  <option value="holiday">Holiday</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start</label>
                <input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-2 w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End</label>
                <input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-2 w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full px-3 py-2 border rounded-lg" placeholder="Add details for the event, instructions, venue, etc." />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-sm text-gray-500">
                {editMode && selectedEvent ? (
                  <>
                    Selected: <span className="font-medium text-gray-700">{selectedEvent.title}</span>
                  </>
                ) : (
                  <span>Slot: <span className="font-medium">{selectedSlot ? `${format(new Date(selectedSlot.start), "dd MMM yyyy, HH:mm")} — ${format(new Date(selectedSlot.end), "dd MMM yyyy, HH:mm")}` : "Manual"}</span></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editMode && (
                  <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                    <FiTrash2 /> Delete
                  </button>
                )}

                <button onClick={() => { setModalOpen(false); setSelectedEvent(null); }} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>

                <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  {editMode ? "Update Event" : "Create Event"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* small loading indicator */}
      {loading && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow">
            <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-xs text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
