"use client";

import { useState } from "react";
import HabitCard from "./HabitCard";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddHabitModal from "./AddHabitModal";
import { format, addDays, subDays, isSameDay } from "date-fns";

const MOCK_HABITS = [
    { id: "1", name: "Read 10 pages", color: "#6366f1", icon: "Book", isCompleted: false },
    { id: "2", name: "Drink Water", color: "#3b82f6", icon: "Droplets", isCompleted: true },
    { id: "3", name: "Exercise", color: "#10b981", icon: "Dumbbell", isCompleted: false },
    { id: "4", name: "Meditate", color: "#8b5cf6", icon: "Wind", isCompleted: false },
];

export default function HabitList() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [habits, setHabits] = useState(MOCK_HABITS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleHabit = (id: string) => {
        setHabits((prev) =>
            prev.map((h) => (h.id === id ? { ...h, isCompleted: !h.isCompleted } : h))
        );
    };

    const addHabit = (habit: any) => {
        setHabits((prev) => [...prev, habit]);
    };

    const nextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const prevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const resetToToday = () => setSelectedDate(new Date());

    const isToday = isSameDay(selectedDate, new Date());

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-display tracking-tight">FlowHabit</h1>
                    <p className="text-muted-foreground text-sm">One loop at a time.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background dark:bg-accent dark:text-accent-foreground rounded-2xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Habit</span>
                </button>
            </header>

            <section className="bg-card border border-border rounded-3xl p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevDay}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div className="text-center min-w-[120px]">
                            <h2 className="font-bold text-lg">
                                {isToday ? "Today" : format(selectedDate, "EEE, MMM do")}
                            </h2>
                            {!isToday && (
                                <button
                                    onClick={resetToToday}
                                    className="text-[10px] uppercase tracking-wider font-bold text-accent"
                                >
                                    Back to Today
                                </button>
                            )}
                        </div>
                        <button
                            onClick={nextDay}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                        <CalendarIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[-3, -2, -1, 0, 1, 2, 3].map((off) => {
                        const date = addDays(new Date(), off);
                        const selected = isSameDay(date, selectedDate);
                        return (
                            <button
                                key={off}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "flex flex-col items-center min-w-[50px] py-3 rounded-2xl transition-all",
                                    selected
                                        ? "bg-accent text-accent-foreground shadow-md scale-105"
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <span className="text-[10px] uppercase font-bold opacity-70">
                                    {format(date, "EEE")}
                                </span>
                                <span className="text-lg font-bold">
                                    {format(date, "d")}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {habits.length > 0 ? (
                        habits.map((habit) => (
                            <HabitCard
                                key={habit.id}
                                {...habit}
                                onToggle={toggleHabit}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/50 rounded-3xl border border-dashed border-border">
                            <p className="text-muted-foreground">No habits yet. Start by creating your first loop!</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AddHabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addHabit}
            />
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
