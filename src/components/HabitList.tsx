"use client";

import { useState, useEffect } from "react";
import { Plus, Check, MoreVertical, Edit2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddHabitModal from "./AddHabitModal";
import { format, subDays } from "date-fns";
import { getHabits, addHabit as addHabitAction, toggleHabitCompletion, deleteHabit, updateHabit } from "@/app/actions";
import { useUser, useClerk, UserButton, SignInButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { syncLocalHabits } from "@/app/syncActions";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function HabitList() {
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();
    const [habits, setHabits] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingHabit, setEditingHabit] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        // Only close if we clicked outside of a habit card action area
        // For simplicity, now we just let the user toggle it off or click outside.
        const handleClickOutside = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('button')) return; // Don't close if clicking a button (like toggle)
            setOpenMenuId(null);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const daysToShow = 6; // 5 previous + today
    const dates = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysToShow - 1 - i));
        return d;
    });

    // Helper to calculate score client-side
    const calculateScore = (history: Record<string, boolean>) => {
        const today = new Date();
        let count = 0;
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dStr = format(d, "yyyy-MM-dd");
            if (history[dStr]) count++;
        }
        return Math.round((count / 30) * 100);
    };

    // Sync local habits on login
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            // User is authenticated
            const stored = localStorage.getItem("localHabits");
            if (stored) {
                const localHabits = JSON.parse(stored);
                if (localHabits.length > 0) {
                    syncLocalHabits(localHabits).then(() => {
                        localStorage.removeItem("localHabits");
                        fetchHabits();
                    });
                } else {
                    fetchHabits();
                }
            } else {
                fetchHabits();
            }
        } else {
            // User is NOT authenticated (Guest)
            const stored = localStorage.getItem("localHabits");
            if (stored) {
                const parsed = JSON.parse(stored);
                // Calculate scores on load
                setHabits(parsed.map((h: any) => {
                    const history = h.recentHistory || {};
                    return {
                        ...h,
                        recentHistory: history,
                        score: calculateScore(history)
                    };
                }));
            } else {
                setHabits([]);
            }
            setIsLoading(false);
        }
    }, [isLoaded, user]);


    const fetchHabits = async () => {
        setIsLoading(true);
        try {
            if (user) {
                const data = await getHabits(); // Returns habits with history
                setHabits(data);
            }
        } catch (error) {
            console.error("Error fetching habits:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleHabit = async (habitId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");

        // Optimistic update
        setHabits(prev => prev.map(h => {
            if (h.id === habitId) {
                const currentStatus = h.recentHistory?.[dateStr] || false;
                const newHistory = { ...h.recentHistory, [dateStr]: !currentStatus };
                // Recalculate score for immediate UI update (works for both but critical for guest)
                const newScore = calculateScore(newHistory);
                return { ...h, recentHistory: newHistory, score: newScore };
            }
            return h;
        }));

        const habit = habits.find(h => h.id === habitId);
        const isCompleted = !habit?.recentHistory?.[dateStr]; // Target state

        if (user) {
            await toggleHabitCompletion(habitId, dateStr, isCompleted);
            // We could refetch to be safe, but optimistic update handles the score visual for now.
            // If the server calculation differs slightly, it will correct on next load.
        } else {
            // Local storage update
            const updated = habits.map(h => {
                if (h.id === habitId) {
                    const currentStatus = h.recentHistory?.[dateStr] || false;
                    const newHistory = { ...h.recentHistory, [dateStr]: !currentStatus };
                    const newScore = calculateScore(newHistory);
                    return { ...h, recentHistory: newHistory, score: newScore };
                }
                return h;
            });
            // State is already updated via optimistic update above, but we need to ensure clarity
            // Actually the optimistic update above uses 'prev', so 'habits' here might be stale if strict mode.
            // Let's use functional update or rely on the fact that we just set it?
            // Safer to just re-derive 'updated' from 'habits' state? No, 'habits' is stale in this closure.
            // Best pattern:
            setHabits(prev => {
                const newHabits = prev.map(h => {
                    if (h.id === habitId) {
                        const currentStatus = h.recentHistory?.[dateStr] || false;
                        const newHistory = { ...h.recentHistory, [dateStr]: !currentStatus };
                        const newScore = calculateScore(newHistory);
                        return { ...h, recentHistory: newHistory, score: newScore };
                    }
                    return h;
                });
                localStorage.setItem("localHabits", JSON.stringify(newHabits));
                return newHabits;
            });
        }
    };

    const addHabit = async (habitData: { name: string, color: string }) => {
        if (user) {
            const result = await addHabitAction(habitData.name, habitData.color);
            if (!result.success) {
                alert(`Failed to add habit: ${result.error || "Unknown error"}`);
                return;
            }
            fetchHabits();
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
                recentHistory: {},
                score: 0
            };
            const updated = [...habits, newHabit];
            setHabits(updated);
            localStorage.setItem("localHabits", JSON.stringify(updated));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this habit? This cannot be undone.")) return;

        // Optimistic delete
        setHabits(prev => prev.filter(h => h.id !== id));

        if (user) {
            await deleteHabit(id);
        } else {
            const updated = habits.filter(h => h.id !== id);
            localStorage.setItem("localHabits", JSON.stringify(updated));
        }
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingHabit(id);
        setEditName(currentName);
    };

    const saveEdit = async (id: string, color: string) => {
        // Optimistic update
        setHabits(prev => prev.map(h => h.id === id ? { ...h, name: editName } : h));
        setEditingHabit(null);

        if (user) {
            await updateHabit(id, editName, color);
        } else {
            const updated = habits.map(h => h.id === id ? { ...h, name: editName } : h);
            localStorage.setItem("localHabits", JSON.stringify(updated));
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-2 sm:px-4 pb-32">
            <header className="flex items-center justify-between mb-8 px-2 sm:px-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-display tracking-tight">FlowHabit</h1>
                    <p className="text-muted-foreground text-sm">One loop at a time.</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-3">
                    <ThemeToggle />
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-[10px] sm:text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-foreground text-background dark:bg-accent dark:text-accent-foreground rounded-lg sm:rounded-xl font-semibold shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-[10px] sm:text-sm"
                    >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">New Habit</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </header>

            {/* Grid Header */}
            <div className="grid grid-cols-[1fr_repeat(4,28px)_20px] sm:grid-cols-[1.5fr_repeat(6,minmax(36px,1fr))_36px] gap-1 sm:gap-1.5 mb-4 px-2 sm:px-4 sm:overflow-visible">
                <div className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider self-end pb-2">Habit</div>
                {dates.map((date, i) => {
                    const hiddenClass = i < 2 ? "hidden sm:flex" : "flex";
                    return (
                        <div key={i} className={`${hiddenClass} flex-col items-center`}>
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">{format(date, "EEE")}</span>
                            <span className={`text-xs sm:text-sm font-bold ${i === daysToShow - 1 ? "text-primary bg-primary/10 w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center rounded-full" : ""}`}>
                                {format(date, "d")}
                            </span>
                        </div>
                    );
                })}
                <div className="w-[20px] sm:w-[40px]"></div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-card border border-border rounded-2xl animate-pulse shadow-sm" />
                        ))
                    ) : habits.length > 0 ? (
                        habits.map((habit) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={habit.id}
                                className="group relative bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Mobile: Name takes remaining space, dates are compact (28px), action is minimal (20px) */}
                                <div className="grid grid-cols-[1fr_repeat(4,28px)_20px] sm:grid-cols-[1.5fr_repeat(6,minmax(36px,1fr))_36px] gap-1 sm:gap-1.5 p-2 sm:p-3 items-center relative z-10 bg-card">
                                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-1 sm:pr-2">
                                        {/* Circular Score Indicator */}
                                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-muted/20"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke={habit.color}
                                                    strokeWidth="4"
                                                    strokeDasharray={`${habit.score || 0}, 100`}
                                                    className="transition-all duration-500 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: habit.color }}>
                                                    {habit.score}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Link href={`/habits/${habit.id}`} className="truncate text-xs sm:text-sm font-bold hover:underline decoration-muted-foreground/50 underline-offset-4 decoration-2 block leading-tight">
                                                {habit.name}
                                            </Link>
                                        </div>
                                    </div>

                                    {dates.map((date, i) => {
                                        const dateStr = format(date, "yyyy-MM-dd");
                                        const isCompleted = habit.recentHistory?.[dateStr];
                                        // Hide first 2 days on mobile (indices 0 and 1)
                                        const hiddenClass = i < 2 ? "hidden sm:flex" : "flex";

                                        return (
                                            <div key={i} className={`${hiddenClass} justify-center`}>
                                                <button
                                                    onClick={() => toggleHabit(habit.id, date)}
                                                    className={`
                                                        w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300
                                                        ${isCompleted
                                                            ? "text-white shadow-sm scale-100"
                                                            : "bg-muted/30 border-2 border-transparent hover:border-muted-foreground/20 scale-90 hover:scale-100"
                                                        }
                                                    `}
                                                    style={isCompleted ? { backgroundColor: habit.color } : {}}
                                                >
                                                    {isCompleted && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />}
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Action Trigger Column */}
                                    <div className="flex justify-end pl-0 sm:pl-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === habit.id ? null : habit.id);
                                            }}
                                            className={`p-1 sm:p-2 rounded-full transition-colors ${openMenuId === habit.id ? 'bg-muted text-foreground opacity-100' : 'hover:bg-muted/80 text-muted-foreground'}`}
                                        >
                                            {openMenuId === habit.id ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Edit Mode Panel */}
                                <AnimatePresence mode="wait">
                                    {editingHabit === habit.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="bg-muted/30 border-t border-border"
                                        >
                                            <div className="flex items-center gap-3 p-3 px-4">
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                                                    autoFocus
                                                    placeholder="Habit name..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveEdit(habit.id, habit.color);
                                                        if (e.key === "Escape") setEditingHabit(null);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => saveEdit(habit.id, habit.color)}
                                                    className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-500 font-medium text-sm transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingHabit(null)}
                                                    className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground font-medium text-sm transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Mobile/Desktop Expanded Actions Panel */}
                                <AnimatePresence>
                                    {openMenuId === habit.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-muted/30 border-t border-border overflow-hidden"
                                        >
                                            <div className="flex items-center justify-end gap-2 p-2 px-4">
                                                <button
                                                    onClick={() => {
                                                        startEditing(habit.id, habit.name);
                                                        setOpenMenuId(null); // Close options after selecting edit
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(habit.id);
                                                        setOpenMenuId(null); // Close options after selecting delete
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 transition-colors shadow-sm"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/50 rounded-3xl border border-dashed border-border col-span-full">
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
