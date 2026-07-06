import { useEffect, useState } from 'react';
import ActiveSchedules from './components/ActiveSchedules';
import CreateSchedules from './components/CreateSchedules';
// import LiveLogs from './components/LiveLogs';
import Navbar from './components/Navbar';
import type { SchedulerConfig } from './types';

function App() {
  const [schedules, setSchedules] = useState<SchedulerConfig[]>([]);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchConfiguration = async () => {

    try {
      let response = await fetch(`${VITE_API_BASE_URL}/schedule/getConfigurations`);

      if (!response.ok) {
        throw new Error("Failed to fetch configurations");
      }

      const result = await response.json();

      if (result.status === "successful" && Array.isArray(result.message)) {
        setSchedules(result.message);
      }
    } catch (error) {

      if (error instanceof Error) {
        console.log("error::: Unable to fetch config data:::", error.message)
      };
    }
  }
  useEffect(() => {
    fetchConfiguration()
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 overflow-hidden">
      <div className="h-15 flex-none">
        <Navbar />
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex-1 grid grid-rows-[1fr_auto] grid-cols-[2fr_1fr] p-5 gap-4 overflow-hidden">
        <div className="overflow-hidden">
          <ActiveSchedules schedules={schedules} onUpdated={fetchConfiguration} />
        </div>

        <div className="overflow-hidden">
          <CreateSchedules onCreated={fetchConfiguration} />
        </div>

        {/* <div className="col-span-2 overflow-hidden max-h-[280px]">
          <LiveLogs />
        </div> */}
      </div>
    </div>
  );
}

export default App;
