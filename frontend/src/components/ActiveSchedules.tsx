import { useState } from 'react';
import type { ActiveSchedulesProps, Actions } from '../types';

const ActiveSchedules = ({ schedules, onUpdated }: ActiveSchedulesProps) => {

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const showTopButtons = selectedIds.size > 0;
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(schedules.map(s => s._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const updated = new Set(selectedIds);

    if (checked) {
      updated.add(id);
    } else {
      updated.delete(id);
      // setShowTopButtons(false)
    }
    setSelectedIds(updated);
  };

  const handleActionClick = async (action: Actions) => {

    const ids = [...selectedIds]
    const payload = { ids: ids, status: action }
    console.log(payload);

    try {

      await fetch(`${VITE_API_BASE_URL}/schedule/updateScheduleList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      await onUpdated();

    } catch (error) {
      console.log("error::: Unable to update status", error)
    }
  }

  const allSelected = schedules.length > 0 &&
    schedules.every(s => selectedIds.has(s._id));


  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col h-full w-full text-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Service Manifest: Active Schedules</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage currently active trigger actions on the cluster</p>
        </div>

        {/* Selection count badge */}
        {/* {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              {selectedIds.size} selected
            </span>
          </div>
        )} */}

        {/* {showTopButtons && ( */}
        <div
          className={`
              flex gap-2
              transition-all duration-50 ease-out
              ${showTopButtons
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
              `}>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            onClick={() => handleActionClick("pause")}>
            Pause
          </button>

          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            onClick={() => handleActionClick("active")}>
            Resume
          </button>

          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            onClick={() => handleActionClick("terminate")}>
            Terminate
          </button>
        </div>
        {/* )} */}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-y-auto mt-2 -mx-5 px-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Job Name</th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Schedule</th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Type</th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Date Range</th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
              <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px] text-right">Report ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((item) => (
              <tr
                key={item._id}
                className={`hover:bg-slate-50/50 transition-colors ${selectedIds.has(item._id) ? "bg-blue-50/30" : ""
                  }`}
              >
                <td className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item._id)}
                    onChange={(e) => handleSelectRow(item._id, e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer"
                  />
                </td>

                {/* Report Name */}
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {item.name}
                </td>

                {/* Schedule — time is in minutes for interval, HH:MM for daily */}
                <td className="py-3 px-3">
                  <span className="text-slate-500 font-mono bg-slate-50/40 rounded px-1.5 py-0.5">
                    {item.type === "interval"
                      ? `Every ${item.time} min`
                      : item.time}
                  </span>
                </td>

                {/* Type badge */}
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide leading-none border ${item.type === 'interval'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : 'bg-violet-50 text-violet-700 border-violet-100'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.type === 'interval' ? 'bg-blue-500' : 'bg-violet-500'
                      }`}></span>
                    {item.type}
                  </span>
                </td>

                {/* Date Range — date can be false (schema default) */}
                <td className="py-3 px-3 text-slate-500 font-medium">
                  {item.date && typeof item.date === 'object'
                    ? `${item.date.start || '–'} → ${item.date.end || '–'}`
                    : '–'}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide leading-none border 
                  ${item.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-violet-50 text-violet-700 border-violet-100'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-violet-500'
                      }`}></span>
                    {item.status}
                  </span>
                </td>

                {/* Report ID */}
                <td className="py-3 px-3 text-right">
                  <span className="font-mono text-slate-400 text-[10px]">
                    {item.id || '–'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {schedules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M3.75 7.5h16.5" />
            </svg>
            <p className="text-xs font-medium">No active schedules found</p>
            <p className="text-[10px] mt-0.5">Create a new schedule to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSchedules;