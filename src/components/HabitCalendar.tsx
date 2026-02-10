"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { parseISO } from "date-fns";

interface HabitCalendarProps {
    logs: string[];
    color?: string;
}

export default function HabitCalendar({ logs, color = "var(--primary)" }: HabitCalendarProps) {
    const completedDates = logs.map(d => parseISO(d));

    return (
        <div className="bg-transparent flex justify-center w-full">
            <style>{`
                .rdp-day_selected { 
                    background-color: ${color} !important;
                    color: white !important;
                    font-weight: bold;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 12px ${color}40;
                }
                .rdp-day {
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .rdp-day:hover:not(.rdp-day_selected) {
                    background-color: ${color}20;
                }
            `}</style>
            <DayPicker
                mode="multiple"
                selected={completedDates}
                showOutsideDays={false}
                styles={{
                    root: { margin: 0, width: '100%' },
                    table: { width: '100%', maxWidth: 'none' },
                    caption: { color: "var(--foreground)" },
                    head_cell: { color: "var(--muted-foreground)", fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' },
                    day: { color: "var(--foreground)", fontSize: '12px' }
                }}
            />
        </div>
    );
}
