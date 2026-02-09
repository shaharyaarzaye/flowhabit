"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Edit, MoreVertical, Hash, Trophy } from "lucide-react"; // Renamed Calendar because of recharts conflict if used
import { useState, useEffect } from "react";
import { getHabitDetails } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import HabitCalendar from "@/components/HabitCalendar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { format, parseISO, differenceInDays } from "date-fns";
import { SignInButton, SignedOut, UserButton } from "@clerk/nextjs";

// Helper to calculate stats for guest users (Client-Side)
function processLocalStats(habit: any) {
    const history = habit.recentHistory || {};
    const logs = Object.keys(history).filter(k => history[k]).sort();
    const completedSet = new Set(logs);

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    // 1. Streak
    let streak = 0;
    if (completedSet.has(todayStr)) {
        streak = 1;
        let d = new Date(today);
        d.setDate(d.getDate() - 1);
        while (completedSet.has(format(d, "yyyy-MM-dd"))) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
    } else if (completedSet.has(yesterdayStr)) {
        streak = 1;
        let d = new Date(yesterday);
        d.setDate(d.getDate() - 1);
        while (completedSet.has(format(d, "yyyy-MM-dd"))) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
    }

    // 2. Best Streak (Simplified for Guest: just current or max seen so far?)
    // Real calculation:
    let bestStreak = 0;
    let currentRun = 0;
    // ... iterating logs is complex if gaps exist. 
    // Simplified: Just use 'streak' if it's the best we know, or 0.
    // Let's do a proper Linear Scan of logs for guest mode too.
    if (logs.length > 0) {
        let run = 1;
        let maxRun = 1;
        for (let i = 1; i < logs.length; i++) {
            const prev = parseISO(logs[i - 1]);
            const curr = parseISO(logs[i]);
            const diff = differenceInDays(curr, prev);
            if (diff === 1) {
                run++;
            } else {
                if (run > maxRun) maxRun = run;
                run = 1;
            }
        }
        if (run > maxRun) maxRun = run;
        bestStreak = maxRun;
    }

    // 3. Score (Last 30 days)
    let last30DaysCount = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    logs.forEach(d => {
        if (new Date(d) >= thirtyDaysAgo) last30DaysCount++;
    });
    const score = Math.min(100, Math.round((last30DaysCount / 30) * 100));

    // 4. Month Score
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let currentMonthCount = 0;
    logs.forEach(d => {
        const date = parseISO(d);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            currentMonthCount++;
        }
    });
    const monthScore = Math.round((currentMonthCount / daysInMonth) * 100);

    // 5. Frequency
    const frequencyStats = [0, 0, 0, 0, 0, 0, 0];
    logs.forEach(d => {
        frequencyStats[parseISO(d).getDay()]++;
    });

    // 6. History Stats (Bar Chart)
    const historyMap: Record<string, number> = {};
    logs.forEach(d => {
        const key = format(parseISO(d), "MMM");
        historyMap[key] = (historyMap[key] || 0) + 1;
    });
    const historyStats = Object.entries(historyMap).map(([name, total]) => ({ name, total }));

    // 7. Rolling Score (Ogive)
    const rollingScoreHistory = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dStr = format(d, "MMM dd");

        let windowCompletions = 0;
        const windowStart = new Date(d);
        windowStart.setDate(windowStart.getDate() - 29);

        logs.forEach(completionDateStr => {
            const completionDate = parseISO(completionDateStr);
            if (completionDate >= windowStart && completionDate <= d) {
                windowCompletions++;
            }
        });
        const dayScore = Math.min(100, Math.round((windowCompletions / 30) * 100));
        rollingScoreHistory.push({ name: dStr, score: dayScore, date: d });
    }

    return {
        ...habit,
        logs,
        streak,
        score,
        monthScore,
        totalCompletions: logs.length,
        bestStreaks: [{ length: bestStreak }],
        frequencyStats,
        historyStats,
        rollingScoreHistory
    };
}


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
                            if (found) {
                                const processed = processLocalStats(found);
                                setHabit(processed);
                            }
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

    const bestStreak = habit.bestStreaks?.[0]?.length || 0;

    return (
        <main className="min-h-screen max-w-lg mx-auto py-8 px-6 pb-24 bg-background text-foreground font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex gap-2 items-center">
                    <ThemeToggle />
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-[10px] sm:text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all">
                        <Edit className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Title & Streak Hero */}
            <section className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-muted/30 border border-border/50">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Habit</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{habit.name}</h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto line-clamp-2">{habit.description || "Consistency is key."}</p>

                <div className="mt-8 relative inline-block">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-extrabold tracking-tighter" style={{ color: habit.color }}>
                            {habit.streak}
                        </span>
                        <span className="text-lg font-medium text-muted-foreground uppercase tracking-wide">Day Streak</span>
                    </div>
                </div>
            </section>

            {/* Bento Grid Stats */}
            <section className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-card transition-colors">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Score</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{habit.score}</span>
                        <span className="text-sm text-muted-foreground">%</span>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-card transition-colors">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{habit.totalCompletions}</span>
                        <span className="text-sm text-muted-foreground">times</span>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-card transition-colors">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Best Streak</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{bestStreak}</span>
                        <span className="text-sm text-muted-foreground">days</span>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-card transition-colors">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">This Month</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{habit.monthScore}</span>
                        <span className="text-sm text-muted-foreground">%</span>
                    </div>
                </div>
            </section>

            {/* Ogive Score Curve */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Efficiency Curve</h2>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-4 h-64 relative overflow-hidden">
                    {habit.rollingScoreHistory && habit.rollingScoreHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={habit.rollingScoreHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={habit.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={habit.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-popover border border-border text-popover-foreground text-xs rounded-lg p-2 shadow-xl backdrop-blur-md bg-opacity-90">
                                                    <p className="font-bold mb-1">{payload[0].payload.name}</p>
                                                    <p>Efficiency: <span style={{ color: habit.color }}>{payload[0].value}%</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke={habit.color}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                            <p className="text-xs">Not enough data for curve</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Activity Heatmap (GitHub/LeetCode Style) */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Activity Map</h2>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-6 overflow-x-auto">
                    <div className="min-w-[700px]">
                        {/* 
                            Robust SVG Heatmap Implementation 
                            We will render the last ~6 months (26 weeks) of data.
                        */}
                        {(() => {
                            const today = new Date();
                            const weeksToRender = 28; // Approx 6 months
                            const days: { date: Date; dateStr: string; level: number }[] = [];

                            // 1. Generate standard array of days ending today
                            // But we align end to Saturday for standard grid look?
                            // Or align to today. Let's align end to Today.

                            // Actually standard is: Columns are weeks (Sun-Sat).
                            // Last column might be partial if today isn't Saturday.
                            const endDate = new Date(today);
                            // Normalize to end of week (Saturday) to keep grid square?
                            // Or just stop at today. Let's stop at today.

                            // Find start date:
                            // We need (weeksToRender * 7) days roughly.
                            // But we want the fast "vertical column = week" layout.
                            // So let's iterate weeks back.

                            // Let's build a grid of [WeekIndex][DayIndex]
                            const weeks = [];
                            for (let w = 0; w < weeksToRender; w++) {
                                const weekDays = [];
                                for (let d = 0; d < 7; d++) {
                                    // Week 0 is "This Week" (or furthest back? usually graphs go Left->Right, so Oldest->Newest)
                                    // Let's render Left->Right.
                                    // So Week 0 is (28 weeks ago).

                                    // Calculate date for Week W, Day D.
                                    // We need to anchor to "Today". Use consistent anchor.
                                    // Let's anchor the Last Cell (weeksToRender-1, todayDayOfWeek) = Today.

                                    // Simpler: Start Date = Today - (weeksToRender * 7) days?
                                    // Let's align the Start Date to a Sunday for cleanliness.

                                    // Find "Last Sunday". 
                                    const lastSunday = new Date(today);
                                    lastSunday.setDate(today.getDate() - today.getDay());

                                    // Start Sunday = Last Sunday - (weeksToRender - 1) weeks
                                    const startSunday = new Date(lastSunday);
                                    startSunday.setDate(lastSunday.getDate() - ((weeksToRender - 1) * 7));

                                    // Current Cell Date
                                    const cellDate = new Date(startSunday);
                                    cellDate.setDate(startSunday.getDate() + (w * 7) + d);

                                    const dateStr = format(cellDate, "yyyy-MM-dd");
                                    const isCompleted = habit.logs.includes(dateStr);
                                    const isFuture = cellDate > today;

                                    weekDays.push({ date: cellDate, dateStr, isCompleted, isFuture });
                                }
                                weeks.push(weekDays);
                            }

                            // Generate Month Labels
                            const monthLabels: { text: string; x: number }[] = [];
                            let lastMonth = -1;
                            weeks.forEach((week, wIndex) => {
                                const firstDayOfWeek = week[0].date;
                                const month = firstDayOfWeek.getMonth();
                                if (month !== lastMonth) {
                                    monthLabels.push({ text: format(firstDayOfWeek, "MMM"), x: wIndex });
                                    lastMonth = month;
                                }
                            });

                            return (
                                <div className="flex flex-col gap-2">
                                    {/* Month Labels */}
                                    <div className="flex text-[10px] text-muted-foreground h-4 relative w-full">
                                        {monthLabels.map((label, i) => (
                                            <span
                                                key={i}
                                                className="absolute top-0"
                                                style={{ left: `${label.x * 16}px` }} // 16px is approx width of col + gap
                                            >
                                                {label.text}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-[3px]">
                                        {weeks.map((week, wIndex) => (
                                            <div key={wIndex} className="flex flex-col gap-[3px]">
                                                {week.map((day, dIndex) => (
                                                    <div
                                                        key={`${wIndex}-${dIndex}`}
                                                        title={`${format(day.date, "MMM d, yyyy")}: ${day.isCompleted ? "Completed" : "No activity"}`}
                                                        className={`w-3 h-3 rounded-[2px] transition-all duration-200 ${day.isFuture ? 'opacity-0' :
                                                            day.isCompleted ? '' : 'bg-muted/30 hover:bg-muted/50'
                                                            }`}
                                                        style={{
                                                            backgroundColor: day.isCompleted ? habit.color : undefined
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                        <span>Less</span>
                                        <div className="flex gap-1">
                                            <div className="w-2.5 h-2.5 rounded-[1px] bg-muted/30"></div>
                                            <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: habit.color, opacity: 0.4 }}></div>
                                            <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: habit.color, opacity: 0.7 }}></div>
                                            <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: habit.color }}></div>
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Frequency (Existing but polished) */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Frequency</h2>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-6">
                    <div className="grid grid-cols-7 gap-2 h-32 items-end">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                            const count = frequencyData[idx];
                            const height = maxFreq > 0 ? (count / maxFreq) * 100 : 0;

                            return (
                                <div key={day} className="flex flex-col items-center gap-3 h-full justify-end group">
                                    <div className="w-full relative flex-1 flex items-end justify-center">
                                        <div
                                            className="w-1.5 sm:w-2 rounded-full bg-muted/20 relative overflow-hidden transition-all duration-500"
                                            style={{ height: '100%' }}
                                        >
                                            <div
                                                className="absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    height: `${Math.max(height, 0)}%`,
                                                    backgroundColor: count > 0 ? habit.color : 'transparent'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{day[0]}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </main>
    );
}
