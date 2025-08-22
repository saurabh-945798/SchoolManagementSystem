// StudentCalendar.jsx
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
import { FiSearch, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { MdOutlineEvent } from "react-icons/md";
import { HiOutlineCalendar } from "react-icons/hi";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EVENT_COLORS = {
  exam: "#EF4444",
  ptm: "#F59E0B",
  holiday: "#10B981",
  event: "#3B82F6",
};

const TYPE_LABEL = {
  exam: "Exam",
  ptm: "PTM",
  holiday: "Holiday",
  event: "Event",
};

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ exam: true, ptm: true, holiday: true, event: true });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [smallLoading, setSmallLoading] = useState(false);

  const token = localStorage.getItem("studentToken");

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await axios.get("/api/calendar/all", { headers: { Authorization: `Bearer ${token}` } });
      const mapped = (res.data || []).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
      // Keep sorted by start
      mapped.sort((a, b) => new Date(a.start) - new Date(b.start));
      setEvents(mapped);
    } catch (err) {
      console.error("Failed to load events:", err);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }

  // Filtered & searched events for calendar
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => {
      if (!filters[ev.type]) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (ev.title || "").toLowerCase().includes(q) || (ev.description || "").toLowerCase().includes(q);
    });
  }, [events, filters, query]);

  // style each event
  const eventStyleGetter = (event) => {
    const bg = EVENT_COLORS[event.type] || "#6366F1";
    const isToday = isSameDay(event.start, new Date());
    return {
      style: {
        backgroundColor: bg,
        color: "#fff",
        borderRadius: 8,
        padding: "6px 8px",
        boxShadow: isToday ? "0 8px 20px rgba(59,130,246,0.12)" : "none",
        border: "none",
        fontWeight: 600,
      },
    };
  };

  // Compact event rendering on calendar cells
  const EventCard = ({ event }) => {
    return (
      <div>
        <div className="truncate">{event.title}</div>
        <div className="text-xs opacity-90 mt-1 flex items-center gap-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-white/20">{TYPE_LABEL[event.type]}</span>
          <span>{format(event.start, "dd MMM")}</span>
        </div>
      </div>
    );
  };

  // When user clicks an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // Upcoming events for sidebar
  const upcoming = (events || [])
    .filter((e) => new Date(e.start) >= new Date())
    .slice(0, 8);

  // jump to event date
  const jumpTo = (ev) => {
    setViewDate(new Date(ev.start));
    setTimeout(() => {
      setSelectedEvent(ev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 120);
  };

  // Google Calendar link generator
  function makeGoogleCalLink(ev) {
    if (!ev) return "#";
    const start = new Date(ev.start).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(ev.end).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const text = encodeURIComponent(ev.title || "");
    const details = encodeURIComponent(ev.description || "");
    const location = encodeURIComponent(ev.venue || "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <MdOutlineEvent className="w-9 h-9 text-indigo-600" />
              <span>Academic Calendar</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">View school events, exams, PTMs & holidays — all in one place.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or description..."
                className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-80 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilters({ exam: true, ptm: true, holiday: true, event: true });
                  setQuery("");
                }}
                className="px-3 py-2 rounded-lg bg-white border hover:shadow"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* main card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left: calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewDate((d) => addDays(d, -30))}
                  className="p-2 rounded-md border hover:bg-gray-50"
                  title="Previous month"
                >
                  <FiChevronLeft />
                </button>
                <div className="px-3 py-2 rounded-md bg-gray-50 text-sm font-medium">{format(viewDate, "MMMM yyyy")}</div>
                <button
                  onClick={() => setViewDate((d) => addDays(d, 30))}
                  className="p-2 rounded-md border hover:bg-gray-50"
                  title="Next month"
                >
                  <FiChevronRight />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="hidden sm:flex items-center gap-3">
                  <HiOutlineCalendar className="w-5 h-5 text-indigo-500" />
                  <div>Showing: <span className="font-medium text-gray-700 ml-1">{visibleEvents.length} events</span></div>
                </div>
                <div className="text-xs text-gray-400">Tip: Click an event to view details</div>
              </div>
            </div>

            <div style={{ height: "72vh" }}>
              <Calendar
                localizer={localizer}
                events={visibleEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.MONTH}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onSelectEvent={handleSelectEvent}
                components={{ event: EventCard }}
                eventPropGetter={eventStyleGetter}
                date={viewDate}
                onNavigate={(date) => setViewDate(date)}
                popup
              />
            </div>
          </div>

          {/* right: filters + upcoming */}
          <aside className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.keys(filters).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilters((prev) => ({ ...prev, [k]: !prev[k] }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${filters[k] ? "bg-[rgba(59,130,246,0.12)]" : "bg-gray-50"}`}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: EVENT_COLORS[k] }} />
                    {TYPE_LABEL[k]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>Upcoming</span>
                <span className="text-xs text-gray-400">{upcoming.length} items</span>
              </h3>

              <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                {upcoming.length === 0 ? (
                  <div className="text-sm text-gray-400">No upcoming events.</div>
                ) : (
                  upcoming.map((ev) => (
                    <motion.div
                      key={ev._id || `${ev.title}-${ev.start}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => jumpTo(ev)}
                    >
                      <div style={{ background: EVENT_COLORS[ev.type] }} className="w-2 h-12 rounded" />
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-1">{ev.title}</div>
                        <div className="text-xs text-gray-400">{TYPE_LABEL[ev.type]} • {format(new Date(ev.start), "dd MMM yyyy, hh:mm a")}</div>
                      </div>
                      <div className="text-xs text-gray-400">{new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => {
                  setSmallLoading(true);
                  fetchEvents().finally(() => setTimeout(() => setSmallLoading(false), 600));
                }}
                className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white flex items-center justify-center gap-2"
              >
                {smallLoading ? "Refreshing..." : "Refresh Events"}
              </button>
            </div>
          </aside>
        </div>

        {/* Event detail modal (read-only) */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">{TYPE_LABEL[selectedEvent.type]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedEvent(null)} className="text-sm text-gray-500">Close</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600">{selectedEvent.description || "No description provided."}</div>
                  <div className="mt-3 text-sm text-gray-500">Venue: <span className="text-gray-700">{selectedEvent.venue || "Not specified"}</span></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Starts</div>
                  <div className="text-sm font-medium">{format(new Date(selectedEvent.start), "dd MMM yyyy, hh:mm a")}</div>
                  <div className="mt-3 text-xs text-gray-500">Ends</div>
                  <div className="text-sm font-medium">{format(new Date(selectedEvent.end), "dd MMM yyyy, hh:mm a")}</div>

                  <a target="_blank" rel="noreferrer" href={makeGoogleCalLink(selectedEvent)} className="mt-4 inline-block text-center w-full px-3 py-2 bg-indigo-600 text-white rounded-lg">
                    Add to Google Calendar
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* lightweight full-screen loader while initial load */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
            <div className="mt-3 text-sm text-gray-600">Loading calendar...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;
