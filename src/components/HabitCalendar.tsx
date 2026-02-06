"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

interface HabitCalendarProps {
    completedDates: Date[];
}

export default function HabitCalendar({ completedDates }: HabitCalendarProps) {
    return (
        <div className="bg-card p-4 rounded-2xl border border-border">
            <DayPicker
                mode="multiple"
                selected={completedDates}
                modifiers={{
                    completed: completedDates,
                }}
                modifiersClassNames={{
                    completed: "bg-accent text-accent-foreground rounded-full",
                }}
                className="mx-auto"
            />
            <style jsx global>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: var(--accent);
          --rdp-background-color: var(--muted);
          margin: 0;
        }
        .rdp-day_selected {
          background-color: var(--accent) !important;
          color: var(--accent-foreground) !important;
        }
      `}</style>
        </div>
    );
}
