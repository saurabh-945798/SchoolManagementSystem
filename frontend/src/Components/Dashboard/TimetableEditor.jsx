// import React, { useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import {
//   PlusCircleIcon,
//   TrashIcon,
//   ClockIcon,
//   AcademicCapIcon,
//   ArrowDownCircleIcon,
//   ArrowUpCircleIcon
// } from "@heroicons/react/24/outline";

// const daysOfWeek = [
//   "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
// ];

// const CreateTimetable = () => {
//   const [classNum, setClassNum] = useState("");
//   const [section, setSection] = useState("");
//   const [openDay, setOpenDay] = useState(null); // accordion toggle
//   const [days, setDays] = useState(
//     daysOfWeek.map(day => ({ day, periods: [] }))
//   );

//   const addPeriod = (dayIndex) => {
//     const updated = [...days];
//     updated[dayIndex].periods.push({
//       periodNumber: updated[dayIndex].periods.length + 1,
//       subject: "",
//       startTime: "",
//       endTime: ""
//     });
//     setDays(updated);
//   };

//   const updatePeriod = (dayIndex, periodIndex, field, value) => {
//     const updated = [...days];
//     updated[dayIndex].periods[periodIndex][field] = value;
//     setDays(updated);
//   };

//   const removePeriod = (dayIndex, periodIndex) => {
//     const updated = [...days];
//     updated[dayIndex].periods.splice(periodIndex, 1);
//     updated[dayIndex].periods.forEach((p, i) => {
//       p.periodNumber = i + 1;
//     });
//     setDays(updated);
//   };

//   const handleSubmit = async () => {
//     if (!classNum || !section) {
//       toast.error("Please select class and section");
//       return;
//     }
//     try {
//       const res = await axios.post("/api/timetable", {
//         class: classNum,
//         section,
//         days
//       });
//       toast.success("Timetable created successfully 🎉");
//       console.log(res.data);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error creating timetable");
//     }
//   };

//   return (
//     <div className="p-4 md:p-6 max-w-6xl mx-auto">
//       {/* Top Header */}
//       <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
//           <AcademicCapIcon className="w-7 h-7 text-blue-500" />
//           Create Class Timetable
//         </h2>
//         <div className="flex gap-4">
//           <select
//             className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-28"
//             value={classNum}
//             onChange={(e) => setClassNum(e.target.value)}
//           >
//             <option value="">Class</option>
//             {[...Array(12)].map((_, i) => (
//               <option key={i + 1} value={i + 1}>{i + 1}</option>
//             ))}
//           </select>
//           <select
//             className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-28"
//             value={section}
//             onChange={(e) => setSection(e.target.value)}
//           >
//             <option value="">Section</option>
//             {["A", "B", "C", "D"].map(sec => (
//               <option key={sec} value={sec}>{sec}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Days with Accordion */}
//       {days.map((dayObj, dayIndex) => (
//         <div
//           key={dayObj.day}
//           className="mb-4 rounded-xl shadow-lg bg-white/60 backdrop-blur-sm border border-gray-200 overflow-hidden transition-all"
//         >
//           <div
//             className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
//             onClick={() => setOpenDay(openDay === dayIndex ? null : dayIndex)}
//           >
//             <h3 className="text-lg font-semibold text-blue-600">{dayObj.day}</h3>
//             {openDay === dayIndex ? (
//               <ArrowUpCircleIcon className="w-6 h-6 text-blue-500" />
//             ) : (
//               <ArrowDownCircleIcon className="w-6 h-6 text-blue-500" />
//             )}
//           </div>

//           {openDay === dayIndex && (
//             <div className="p-5 space-y-4 animate-fadeIn">
//               {dayObj.periods.length === 0 && (
//                 <p className="text-gray-500 italic">No periods added yet.</p>
//               )}

//               {dayObj.periods.map((period, periodIndex) => (
//                 <div
//                   key={periodIndex}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
//                 >
//                   <input
//                     type="text"
//                     placeholder="Subject"
//                     className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400"
//                     value={period.subject}
//                     onChange={(e) => updatePeriod(dayIndex, periodIndex, "subject", e.target.value)}
//                   />
//                   <div className="flex items-center gap-2">
//                     <ClockIcon className="w-5 h-5 text-gray-500" />
//                     <input
//                       type="time"
//                       className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400"
//                       value={period.startTime}
//                       onChange={(e) => updatePeriod(dayIndex, periodIndex, "startTime", e.target.value)}
//                     />
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <ClockIcon className="w-5 h-5 text-gray-500" />
//                     <input
//                       type="time"
//                       className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400"
//                       value={period.endTime}
//                       onChange={(e) => updatePeriod(dayIndex, periodIndex, "endTime", e.target.value)}
//                     />
//                   </div>
//                   <button
//                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-all"
//                     onClick={() => removePeriod(dayIndex, periodIndex)}
//                   >
//                     <TrashIcon className="w-5 h-5" /> Remove
//                   </button>
//                 </div>
//               ))}

//               <button
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 transition-transform transform hover:scale-105"
//                 onClick={() => addPeriod(dayIndex)}
//               >
//                 <PlusCircleIcon className="w-5 h-5" /> Add Period
//               </button>
//             </div>
//           )}
//         </div>
//       ))}

//       {/* Submit */}
//       <div className="text-center mt-8">
//         <button
//           className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg text-lg flex items-center gap-2 mx-auto transition-transform transform hover:scale-110"
//           onClick={handleSubmit}
//         >
//           💾 Save Timetable
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CreateTimetable;




import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const rowVariant = {
  hidden: { opacity: 0, y: -6 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 } })
};

const accordionVariant = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1, transition: { duration: 0.28 } }
};

const CreateTimetable = () => {
  const token = localStorage.getItem("adminToken");

  const [classNum, setClassNum] = useState("");
  const [section, setSection] = useState("");
  const [openDay, setOpenDay] = useState(null); // accordion toggle
  const [days, setDays] = useState(
    daysOfWeek.map((day) => ({ day, periods: [] }))
  );
  const [saving, setSaving] = useState(false);

  const addPeriod = (dayIndex) => {
    const updated = [...days];
    updated[dayIndex].periods.push({
      periodNumber: updated[dayIndex].periods.length + 1,
      subject: "",
      startTime: "",
      endTime: ""
    });
    setDays(updated);
  };

  const updatePeriod = (dayIndex, periodIndex, field, value) => {
    const updated = [...days];
    updated[dayIndex].periods[periodIndex][field] = value;
    setDays(updated);
  };

  const removePeriod = (dayIndex, periodIndex) => {
    const updated = [...days];
    updated[dayIndex].periods.splice(periodIndex, 1);
    updated[dayIndex].periods.forEach((p, i) => {
      p.periodNumber = i + 1;
    });
    setDays(updated);
  };

  const handleSubmit = async () => {
    if (!classNum || !section) {
      toast.error("Please select class and section");
      return;
    }
    if (!token) {
      toast.error("Admin not authenticated. Please login.");
      return;
    }

    // Basic validation: ensure each added period has subject & times
    for (const d of days) {
      for (const p of d.periods) {
        if (!p.subject || !p.startTime || !p.endTime) {
          toast.error("Fill subject & times for all periods or remove incomplete rows");
          return;
        }
      }
    }

    try {
      setSaving(true);
      const res = await axios.post(
        "/api/timetable",
        {
          class: classNum,
          section,
          days
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Timetable created successfully 🎉");
      console.log(res.data);
      // Reset form if you want here, or refetch timetables etc.
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating timetable");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create Class Timetable</h1>
            <p className="text-sm text-gray-500">Build a timetable — add subjects & timings for each day</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-28"
            value={classNum}
            onChange={(e) => setClassNum(e.target.value)}
          >
            <option value="">Class</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          <select
            className="border border-gray-200 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-28"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">Section</option>
            {["A", "B", "C", "D"].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white shadow-lg flex items-center gap-2 ${
              saving ? "bg-gray-400 cursor-wait" : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            }`}
          >
            <span className="hidden md:inline">💾 Save Timetable</span>
            <span className="md:hidden">Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Days accordion */}
        <div className="md:col-span-2 space-y-4">
          {days.map((dayObj, dayIndex) => (
            <motion.div
              key={dayObj.day}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenDay(openDay === dayIndex ? null : dayIndex)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                aria-expanded={openDay === dayIndex}
                aria-controls={`day-${dayIndex}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-indigo-600 font-semibold">
                    {dayObj.day.slice(0,3)}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{dayObj.day}</div>
                    <div className="text-sm text-gray-500">{dayObj.periods.length} period{dayObj.periods.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400 hidden sm:block">Drag to reorder</div>
                  <div className="p-1 rounded hover:bg-gray-100">
                    {openDay === dayIndex ? (
                      <ArrowUpCircleIcon className="w-6 h-6 text-blue-500" />
                    ) : (
                      <ArrowDownCircleIcon className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {openDay === dayIndex && (
                  <motion.div
                    key={`panel-${dayIndex}`}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={accordionVariant}
                    id={`day-${dayIndex}`}
                    className="px-5 pb-5 pt-1"
                  >
                    {/* Period rows */}
                    {dayObj.periods.length === 0 && (
                      <div className="py-6 text-center text-gray-500 italic">No periods yet — add one below.</div>
                    )}

                    <div className="space-y-3">
                      {dayObj.periods.map((period, periodIndex) => (
                        <motion.div
                          key={periodIndex}
                          custom={periodIndex}
                          variants={rowVariant}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg hover:shadow-sm transition"
                        >
                          <div className="col-span-1 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                              {period.periodNumber}
                            </div>
                          </div>

                          <div className="col-span-6">
                            <input
                              type="text"
                              placeholder="Subject (e.g. Maths)"
                              value={period.subject}
                              onChange={(e) => updatePeriod(dayIndex, periodIndex, "subject", e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>

                          <div className="col-span-2 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <input
                              type="time"
                              value={period.startTime}
                              onChange={(e) => updatePeriod(dayIndex, periodIndex, "startTime", e.target.value)}
                              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>

                          <div className="col-span-2 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <input
                              type="time"
                              value={period.endTime}
                              onChange={(e) => updatePeriod(dayIndex, periodIndex, "endTime", e.target.value)}
                              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>

                          <div className="col-span-1 flex items-center justify-end">
                            <button
                              onClick={() => removePeriod(dayIndex, periodIndex)}
                              title="Remove period"
                              className="p-2 rounded-full hover:bg-red-50 text-red-600"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Add button */}
                    <div className="mt-4">
                      <button
                        onClick={() => addPeriod(dayIndex)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add Period
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Right: Preview / Tips */}
        <aside className="hidden md:block p-4 rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bars3Icon className="w-6 h-6 text-indigo-600" />
            <div>
              <div className="text-sm font-semibold text-gray-800">Quick Tips</div>
              <div className="text-xs text-gray-500">Small helpers to speed things up</div>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li>• Use consistent time format (24-hour) for easier sorting.</li>
            <li>• Keep lunch/break as a period with subject "LUNCH" for uniform data.</li>
            <li>• Period numbers auto-increment — remove & re-add to renumber.</li>
            <li>• Save once after building the full week to create the timetable.</li>
          </ul>

          <div className="mt-6">
            <div className="text-xs text-gray-500 mb-2">Preview</div>
            <div className="bg-white border rounded-lg p-3">
              <div className="text-sm text-gray-700 font-medium">Sample period</div>
              <div className="mt-2 text-sm text-gray-500">1 • Maths • 08:00 — 09:00</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating mobile save */}
      <div className="fixed left-4 right-4 bottom-6 md:hidden z-40">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full py-3 rounded-xl text-white text-center font-semibold shadow-lg ${
            saving ? "bg-gray-400" : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          }`}
        >
          {saving ? "Saving..." : "Save Timetable"}
        </button>
      </div>
    </div>
  );
};

export default CreateTimetable;
