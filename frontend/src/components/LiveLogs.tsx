import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../api';
import type { ReportStatus } from '../types';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

/**
 * Maps a ReportStatus from the backend into a LogEntry for display.
 * Backend reportStatus model has: status, message, type, scheduleTime, name
 */
function mapStatusToLog(status: ReportStatus): LogEntry {
  let level: LogEntry['level'] = 'info';
  if (status.status === 'failed') {
    level = 'error';
  } else if (status.status === 'success' || status.status === 'successful') {
    level = 'success';
  }

  return {
    id: status._id,
    timestamp: status.scheduleTime || '–',
    level,
    message: `[${status.name || 'Unknown'}] ${status.message}`,
  };
}

const LiveLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const fetchReportStatuses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/status`);

      if (!response.ok) {
        // 404 means no data — not a real error
        if (response.status === 404) {
          setLogs([]);
          setError(null);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'successful' && Array.isArray(result.message)) {
        const mapped = result.message.map(mapStatusToLog);
        setLogs(mapped);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log('error::: Unable to fetch report status:::', err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + poll every 10 seconds
  useEffect(() => {
    fetchReportStatuses();

    const interval = setInterval(() => {
      fetchReportStatuses();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col h-full w-full text-slate-900 shadow-sm overflow-hidden">
      {/* Title block */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Report Execution Logs</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Live report generation status from the scheduler</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Polling
          </span>
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            Clear Console
          </button>
        </div>
      </div>

      {/* Terminal emulator container */}
      <div className="bg-slate-950 rounded-xl border border-slate-850 flex-1 flex flex-col overflow-hidden shadow-inner">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-950">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/85"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/85"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85"></span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 font-mono">report-status — /schedule/status</span>
          <span className="w-10"></span>
        </div>

        {/* Logs Output */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-350">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
              Connecting to scheduler...
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-rose-400 italic">
              Connection error: {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
              No report executions logged yet. Waiting for scheduled reports...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2 mb-1.5 hover:bg-slate-900/40 py-0.5 rounded px-1 transition-colors">
                <span className="text-slate-550 select-none">[{log.timestamp}]</span>
                <span
                  className={`font-bold select-none ${
                    log.level === 'info'
                      ? 'text-blue-400'
                      : log.level === 'success'
                      ? 'text-emerald-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LiveLogs;