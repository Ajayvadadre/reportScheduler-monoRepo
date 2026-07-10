import { useEffect, useState } from 'react';
import Navbar from "./Navbar"
import ActiveSchedules from "./ActiveSchedules"
import CreateSchedules from "./CreateSchedules"
import type { SchedulerConfig } from '../types';
import api from '../api.ts'

const Dashboard = () => {
    const [schedules, setSchedules] = useState<SchedulerConfig[]>([]);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchConfiguration = async () => {

        try {
            const result = await api.get(`${VITE_API_BASE_URL}/schedule/getConfigurations`);

            if (!result) {
                throw new Error("Failed to fetch configurations");
            }

            // const result = await response.json();

            if (result.data.status === "successful" && Array.isArray(result.data.message)) {
                setSchedules(result.data.message);
            } else {
                setSchedules([]);
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

            <div className="flex-1 grid grid-rows-[1fr_auto] grid-cols-[2fr_1fr] p-5 gap-4 overflow-hidden">
                <div className="overflow-hidden">
                    <ActiveSchedules schedules={schedules} onUpdated={fetchConfiguration} />
                </div>

                <div className="overflow-hidden">
                    <CreateSchedules onCreated={fetchConfiguration} />
                </div>
            </div>
        </div>
    )
};

export default Dashboard;