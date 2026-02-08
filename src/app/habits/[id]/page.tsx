"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Edit, MoreVertical, Hash, Trophy } from "lucide-react"; // Renamed Calendar because of recharts conflict if used
import { useState, useEffect } from "react";
import { getHabitDetails } from "@/app/actions";
import HabitCalendar from "@/components/HabitCalendar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { format, parseISO } from "date-fns";

export default function HabitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [habit, setHabit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (id) {
            getHabitDetails(id).then((data) => {
                if (data) {
                    setHabit(data);
                } else {
                    // Try local storage for guest users - simplified fallback
                    const stored = localStorage.getItem("localHabits");
                    if (stored) {
                        const localHabits = JSON.parse(stored);
                        const found = localHabits.find((h: any) => h.id === id);
                        if (found) {
                            setHabit({
                                ...found,
                                description: "Guest Mode: Statistics limited.",
                                streak: 0,
                                totalCompletions: 0,
                                logs: [],
                                score: 0,
                                bestStreaks: [],
                                frequencyStats: [0, 0, 0, 0, 0, 0, 0],
                                historyStats: []
                            });
                        }
                    }
                }
                setLoading(false);
            });
        }
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>;
    if (!habit) return <div className="min-h-screen flex items-center justify-center bg-background">Habit not found</div>;

    // Data prep for charts
    // Score Chart (Mocking a trend for now based on history stats to have a line)
    // Real implementation would calculate rolling score over time.
    // For now, let's just plot the monthly totals as a "Score" proxy or flat line
    const scoreData = habit.historyStats.map((h: any) => ({ name: h.name, score: h.total * 5 })); // Dummy multiplier for visual

    const frequencyData = habit.frequencyStats || [0, 0, 0, 0, 0, 0, 0];
    const maxFreq = Math.max(...frequencyData, 1);

    return (
        <main className="min-h-screen max-w-md mx-auto py-6 px-4 pb-20 bg-background text-foreground">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold truncate max-w-[200px]">{habit.name}</h1>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-full">
                        <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Description/Goal */}
            <div className="mb-8 text-center">
                <p className="text-muted-foreground text-sm font-medium">{habit.description || "No description set"}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Every day</span>
                    <span className="flex items-center gap-1">🔔 Off</span>
                </div>
            </div>

            {/* Overview - Circular Progress & Key Metric */}
            <section className="mb-10">
                <h2 className="text-lg font-bold mb-4 text-primary">Overview</h2>
                <div className="flex items-center justify-between px-4">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-muted" style={{ borderColor: `${habit.color}33`, borderTopColor: habit.color }}>
                            <span className="text-xl font-bold" style={{ color: habit.color }}>
                                {habit.score}%
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-2">Score</span>
                    </div>
                    {/* Month */}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-muted-foreground">{habit.monthScore}%</span>
                        <span className="text-xs text-muted-foreground">Month</span>
                    </div>
                    {/* Year */}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-muted-foreground">{habit.yearScore}%</span>
                        <span className="text-xs text-muted-foreground">Year</span>
                    </div>
                    {/* Total */}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-foreground">{habit.totalCompletions}</span>
                        <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                </div>
            </section>

            {/* Score Graph */}
            <section className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-primary">Score</h2>
                    <span className="text-xs text-muted-foreground">Year</span>
                </div>
                <div className="h-48 w-full">
                    {habit.historyStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={habit.historyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke={habit.color}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: habit.color, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                            Not enough data
                        </div>
                    )}
                </div>
            </section>

            {/* History Bar Chart */}
            <section className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-primary">History</h2>
                    <span className="text-xs text-muted-foreground">Year</span>
                </div>
                <div className="h-48 w-full flex items-end justify-between gap-1">
                    {/* Simple specific bar chart implementation for the "Year" look */}
                    {habit.historyStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={habit.historyStats}>
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {habit.historyStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={habit.color} />
                                    ))}
                                </Bar>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                            No history yet
                        </div>
                    )}
                </div>
            </section>

            {/* Calendar */}
            <section className="mb-10">
                <h2 className="text-lg font-bold mb-4 text-primary">Calendar</h2>
                <div className="bg-card/50 rounded-xl p-2 border border-border">
                    <HabitCalendar completedDates={habit.logs.map((d: string) => {
                        const [y, m, day] = d.split('-').map(Number);
                        // Note: Month is 0-indexed in JS Date
                        return new Date(y, m - 1, day);
                    })} />
                </div>
            </section>

            {/* Best Streaks */}
            <section className="mb-10">
                <h2 className="text-lg font-bold mb-4 text-primary">Best streaks</h2>
                <div className="space-y-2">
                    {habit.bestStreaks && habit.bestStreaks.length > 0 ? (
                        habit.bestStreaks.map((streak: any, idx: number) => (
                            <div key={idx} className="bg-card border border-border rounded-xl p-3 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                    {format(parseISO(streak.start), "MMM d, yyyy")} - {format(parseISO(streak.end), "MMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{streak.length}</span>
                                    <span className="text-xs text-muted-foreground">days</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground text-sm py-4">No streaks recorded yet</div>
                    )}
                </div>
            </section>

            {/* Frequency Dot Chart */}
            <section className="mb-10">
                <h2 className="text-lg font-bold mb-4 text-primary">Frequency</h2>
                <div className="grid grid-cols-7 gap-2 h-32 items-end">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                        const count = frequencyData[idx];
                        // Normalize size for dots (max 5 dots roughly)
                        // Simple visualization: one big dot scaled by freq? 
                        // Or just bubbles. Let's do bubbles.
                        const size = maxFreq > 0 ? (count / maxFreq) * 100 : 0;

                        return (
                            <div key={day} className="flex flex-col items-center gap-2 h-full justify-end">
                                {count > 0 && (
                                    <div
                                        className="rounded-full bg-primary/80 transition-all hover:bg-primary"
                                        style={{
                                            width: `${Math.max(8, Math.min(24, size * 0.4))}px`,
                                            height: `${Math.max(8, Math.min(24, size * 0.4))}px`,
                                            opacity: size > 0 ? 0.5 + (size / 200) : 0
                                        }}
                                    />
                                )}
                                {/* Ensure at least empty space if 0 to align days */}
                                <div
                                    className="rounded-full bg-primary"
                                    style={{
                                        width: `${Math.max(4, Math.min(32, size * 0.4))}px`,
                                        height: `${Math.max(4, Math.min(32, size * 0.4))}px`,
                                        backgroundColor: habit.color
                                    }}
                                />
                                <span className="text-[10px] text-muted-foreground uppercase">{day}</span>
                            </div>
                        )
                    })}
                </div>
            </section>
        </main>
    );
}
