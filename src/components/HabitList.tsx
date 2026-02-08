"use client";

import { useState, useEffect } from "react";
import HabitCard from "./HabitCard";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddHabitModal from "./AddHabitModal";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { getHabits, addHabit as addHabitAction, toggleHabitCompletion } from "@/app/actions";

import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { syncLocalHabits } from "@/app/syncActions";



export default function HabitList() {
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [habits, setHabits] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Sync local habits on login
    useEffect(() => {
        if (isLoaded && user) {
            const stored = localStorage.getItem("localHabits");
            if (stored) {
                const localHabits = JSON.parse(stored);
                if (localHabits.length > 0) {
                    syncLocalHabits(localHabits).then(() => {
                        localStorage.removeItem("localHabits");
                        // Trigger refetch
                        const dateStr = format(selectedDate, "yyyy-MM-dd");
                        getHabits(dateStr).then(setHabits);
                    });
                }
            }
        }
    }, [isLoaded, user]);

    // Fetch habits (Server or Local)
    useEffect(() => {
        const fetchHabits = async () => {
            setIsLoading(true);
            if (isLoaded && user) {
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const data = await getHabits(dateStr);
                setHabits(data);
            } else if (isLoaded && !user) {
                // Local storage mode
                const stored = localStorage.getItem("localHabits");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Reset completion if date changed? For simplicity, keeping as is for now 
                    // or ideally we'd store completions separately.
                    setHabits(parsed);
                } else {
                    setHabits([]);
                }
            }
            setIsLoading(false);
        };
        fetchHabits();
    }, [selectedDate, isLoaded, user]);

    const toggleHabit = async (id: string) => {
        const habitToToggle = habits.find(h => h.id === id);
        if (!habitToToggle) return;

        const newStatus = !habitToToggle.isCompleted;

        // Optimistic update
        setHabits((prev) =>
            prev.map((h) => (h.id === id ? { ...h, isCompleted: newStatus } : h))
        );

        if (user) {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            await toggleHabitCompletion(id, dateStr, newStatus);
        } else {
            // Update local storage
            const updated = habits.map(h => h.id === id ? { ...h, isCompleted: newStatus } : h);
            localStorage.setItem("localHabits", JSON.stringify(updated));
        }
    };

    const addHabit = async (habitData: { name: string, color: string }) => {
        if (user) {
            console.log("Adding habit for authenticated user...");
            const result = await addHabitAction(habitData.name, habitData.color);
            console.log("Add habit result:", result);

            if (!result.success) {
                alert(`Failed to add habit: ${result.error || "Unknown error"}`);
                return;
            }

            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const updatedHabits = await getHabits(dateStr);
            console.log("Fetched updated habits:", updatedHabits);
            setHabits(updatedHabits);
        } else {
            console.log("Adding habit for guest...");
            if (habits.length >= 1) {
                openSignIn();
                return;
            }
            const newHabit = {
                id: Date.now().toString(),
                name: habitData.name,
                color: habitData.color,
                icon: "Circle",
                isCompleted: false
            };
            const updated = [...habits, newHabit];
            setHabits(updated);
            localStorage.setItem("localHabits", JSON.stringify(updated));
        }
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
                <div className="flex items-center gap-4">
                    <UserButton afterSignOutUrl="/" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background dark:bg-accent dark:text-accent-foreground rounded-2xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Habit</span>
                    </button>
                </div>
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
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse shadow-sm" />
                        ))
                    ) : habits.length > 0 ? (
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
