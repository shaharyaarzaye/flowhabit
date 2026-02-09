"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

interface HabitCalendarProps {
    completedDates: Date[];
    color?: string;
}

export default function HabitCalendar({ completedDates, color = "var(--primary)" }: HabitCalendarProps) {
    return (
        <div className="bg-transparent p-2 flex justify-center">
            <DayPicker
                mode="multiple"
                selected={completedDates}
                showOutsideDays={false}
                modifiersClassNames={{
                    selected: "rounded-full font-bold",
                }}
                styles={{
                    day_selected: {
                        backgroundColor: color,
                        color: "#fff", // Always white text on colored background for contrast
                        boxShadow: `0 4px 12px ${color}50` // Subtle glow
                    },
                    root: {
                        margin: 0,
                    },
                    caption: { color: "var(--foreground)" },
                    head_cell: { color: "var(--muted-foreground)" },
                    day: { color: "var(--foreground)" }
                }}
            />
        </div>
    );
}
