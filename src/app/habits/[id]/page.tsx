"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Edit, MoreVertical, Hash, Trophy, TrendingUp, TrendingDown, Info, Filter } from "lucide-react"; // Renamed Calendar because of recharts conflict if used
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
    const logs = Object.keys(history).filter(k => {
        const val = history[k];
        return typeof val === 'object' ? val.completed : val;
    }).sort();
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

    // 2. Best Streak 
    let bestStreak = 0;
    const streaks = [];
    if (logs.length > 0) {
        let start = logs[0];
        let end = logs[0];
        let length = 1;
        for (let i = 1; i < logs.length; i++) {
            const prev = parseISO(logs[i - 1]);
            const curr = parseISO(logs[i]);
            const diff = differenceInDays(curr, prev);
            if (diff === 1) {
                length++;
                end = logs[i];
            } else {
                streaks.push({ start, end, length });
                start = logs[i];
                end = logs[i];
                length = 1;
            }
        }
        streaks.push({ start, end, length });
    }
    const sortedStreaks = streaks.sort((a, b) => b.length - a.length).slice(0, 5);
    bestStreak = sortedStreaks[0]?.length || 0;

    // 3. Score (Last 30 days)
    let last30DaysCount = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    logs.forEach(d => {
        if (new Date(d) >= thirtyDaysAgo) last30DaysCount++;
    });
    const score = Math.min(100, Math.round((last30DaysCount / 30) * 100));

    // 4. Month Score & Delta
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let currentMonthCount = 0;

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    let prevMonthCount = 0;

    logs.forEach(d => {
        const date = parseISO(d);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            currentMonthCount++;
        }
        if (date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear) {
            prevMonthCount++;
        }
    });
    const monthScore = Math.round((currentMonthCount / daysInMonth) * 100);
    const prevMonthScore = Math.round((prevMonthCount / daysInPrevMonth) * 100);
    const monthDelta = monthScore - prevMonthScore;

    // 5. Year Score & Delta
    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = differenceInDays(today, startOfYear) + 1;
    let currentYearCount = 0;

    const prevYear = currentYear - 1;
    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const daysInPrevYear = isLeapYear(prevYear) ? 366 : 365;
    let prevYearCount = 0;

    logs.forEach(d => {
        const date = parseISO(d);
        if (date.getFullYear() === currentYear) {
            currentYearCount++;
        }
        if (date.getFullYear() === prevYear) {
            prevYearCount++;
        }
    });
    const yearScore = Math.round((currentYearCount / dayOfYear) * 100);
    const prevYearScore = Math.round((prevYearCount / daysInPrevYear) * 100);
    const yearDelta = yearScore - prevYearScore;

    // 6. Frequency
    const frequencyStats = [0, 0, 0, 0, 0, 0, 0];
    logs.forEach(d => {
        frequencyStats[parseISO(d).getDay()]++;
    });

    // 7. History (Default monthly)
    const historyMap: Record<string, number> = {};
    logs.forEach(d => {
        const key = format(parseISO(d), "MMM");
        historyMap[key] = (historyMap[key] || 0) + 1;
    });
    const historyStats = Object.entries(historyMap).map(([name, total]) => ({ name, total }));

    // 8. Rolling Score (Ogive) - 365 days
    const rollingScoreHistory = [];
    for (let i = 364; i >= 0; i--) {
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

    // 9. Success Rate
    const earliestLog = logs.length > 0 ? parseISO(logs[0]) : today;
    const daysActive = Math.max(1, differenceInDays(today, earliestLog) + 1);
    const successRate = Math.round((logs.length / daysActive) * 100);

    return {
        ...habit,
        logs,
        streak,
        score,
        monthScore,
        monthDelta,
        yearScore,
        yearDelta,
        totalCompletions: logs.length,
        bestStreaks: sortedStreaks,
        frequencyStats,
        historyStats,
        rollingScoreHistory,
        successRate
    };
}


export default function HabitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [habit, setHabit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filters for charts
    const [scoreFilter, setScoreFilter] = useState<'week' | 'month' | 'year'>('month');
    const [historyFilter, setHistoryFilter] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (id) {
            getHabitDetails(id).then((data) => {
                if (data) {
                    setHabit(data);
                } else {
                    const stored = localStorage.getItem("localHabits");
                    if (stored) {
                        const localHabits = JSON.parse(stored);
                        const found = localHabits.find((h: any) => h.id === id);
                        if (found) {
                            const processed = processLocalStats(found);
                            setHabit(processed);
                        }
                    }
                }
                setLoading(false);
            });
        }
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>;
    if (!habit) return <div className="min-h-screen flex items-center justify-center bg-background">Habit not found</div>;

    // Filter Rolling Score Data
    const getFilteredScoreData = () => {
        if (!habit.rollingScoreHistory) return [];
        const days = scoreFilter === 'week' ? 7 : scoreFilter === 'month' ? 30 : 365;
        return habit.rollingScoreHistory.slice(-days);
    };

    // Filter History Data (Group by year if filter is year)
    const getFilteredHistoryData = () => {
        if (!habit.historyStats) return [];
        if (historyFilter === 'month') return habit.historyStats;
        if (historyFilter === 'week') {
            // Group the last 7 logs by date
            const last7Dates = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return format(d, "yyyy-MM-dd");
            });
            const weekMap: Record<string, number> = {};
            last7Dates.forEach(dStr => {
                weekMap[format(parseISO(dStr), "EEE")] = habit.logs.includes(dStr) ? 1 : 0;
            });
            return Object.entries(weekMap).map(([name, total]) => ({ name, total }));
        }

        // Group habit.logs by year
        const yearMap: Record<string, number> = {};
        habit.logs.forEach((d: string) => {
            const year = format(parseISO(d), "yyyy");
            yearMap[year] = (yearMap[year] || 0) + 1;
        });
        return Object.entries(yearMap).map(([name, total]) => ({ name, total }));
    };

    const scoreData = getFilteredScoreData();
    const historyData = getFilteredHistoryData();
    const frequencyData = habit.frequencyStats || [0, 0, 0, 0, 0, 0, 0];
    const maxFreq = Math.max(...frequencyData, 1);

    const bestStreaks = habit.bestStreaks || [];

    return (
        <main className="min-h-screen max-w-6xl mx-auto py-8 px-4 sm:px-6 pb-24 bg-background text-foreground font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 max-w-lg mx-auto lg:max-w-none">
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
                            <button className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Title & Streak Hero */}
            <section className="mb-10 text-center max-w-lg mx-auto lg:max-w-none">
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-muted/30 border border-border/50">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Habit Details</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">{habit.name}</h1>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-2">{habit.description || "Consistency transforms habits into lifestyle."}</p>
                {habit.type === "quantitative" && (
                    <div className="flex items-center justify-center gap-2 mb-8 opacity-60">
                        <Hash className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Goal: {habit.goalValue} {habit.unit}</span>
                    </div>
                )}
                {!habit.type && <div className="mb-8"></div>}
                {habit.type === "boolean" && <div className="mb-8"></div>}

                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ backgroundColor: `${habit.color}33` }}></div>
                    <div className="relative flex items-baseline justify-center gap-2">
                        <span className="text-7xl sm:text-8xl font-extrabold tracking-tighter" style={{ color: habit.color }}>
                            {habit.streak}
                        </span>
                        <div className="text-left">
                            <span className="block text-lg font-bold text-foreground">DAYS</span>
                            <span className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Streak</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Desktop Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Overview Horizontal Stats */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Info className="w-4 h-4 text-muted-foreground opacity-20" />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                            <div className="flex flex-col items-center">
                                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                                        <circle cx="40" cy="40" r="36" fill="transparent" stroke={habit.color} strokeWidth="4" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - habit.score / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
                                    </svg>
                                    <span className="absolute text-lg font-bold">{habit.score}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-3xl font-bold">{habit.monthDelta > 0 ? '+' : ''}{habit.monthDelta}%</span>
                                    {habit.monthDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Month</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-3xl font-bold">{habit.yearDelta > 0 ? '+' : ''}{habit.yearDelta}%</span>
                                    {habit.yearDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Year</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <span className="text-3xl font-bold" style={{ color: habit.color }}>{habit.successRate || 0}%</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Success Rate</span>
                            </div>
                        </div>
                    </section>

                    {/* Score Chart */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6 relative">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Performance Score</h2>
                            <div className="flex bg-muted/30 p-1 rounded-xl">
                                {(['week', 'month', 'year'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setScoreFilter(f)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all ${scoreFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={scoreData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={habit.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={habit.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                        minTickGap={scoreFilter === 'year' ? 60 : 20}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: habit.color, strokeWidth: 1, strokeDasharray: '5 5' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover/90 border border-border text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                        <p className="font-bold mb-1 opacity-70">{payload[0].payload.name}</p>
                                                        <p className="text-lg font-black" style={{ color: habit.color }}>{payload[0].value}% <span className="text-[8px] opacity-50 uppercase tracking-tighter">Efficiency</span></p>
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
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* History Chart */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Completions History</h2>
                            <div className="flex bg-muted/30 p-1 rounded-xl">
                                {(['week', 'month', 'year'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setHistoryFilter(f)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all ${historyFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const label = historyFilter === 'week' ? "Status" : "Logs";
                                                const val = historyFilter === 'week' ? (payload[0].value === 1 ? "Completed" : "Not Done") : payload[0].value;
                                                return (
                                                    <div className="bg-popover/90 border border-border text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                        <p className="font-bold mb-1 opacity-70">{payload[0].payload.name}</p>
                                                        <p className="text-lg font-black" style={{ color: habit.color }}>{val} <span className="text-[8px] opacity-50 uppercase tracking-tighter">{label}</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        radius={[6, 6, 0, 0]}
                                        animationDuration={1500}
                                    >
                                        {historyData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={habit.color} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Right Column (Details) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Modern Horizontal Calendar Log */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Calendar</h2>
                        </div>

                        <div className="relative">
                            <div className="overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                                <div className="inline-block min-w-full align-middle">
                                    {(() => {
                                        const today = new Date();
                                        const weeksToRender = 16;
                                        const weeks = [];

                                        // Start from 15 weeks ago (Sunday)
                                        const lastSunday = new Date(today);
                                        lastSunday.setDate(today.getDate() - today.getDay());
                                        const startSunday = new Date(lastSunday);
                                        startSunday.setDate(lastSunday.getDate() - ((weeksToRender - 1) * 7));

                                        // Prepare data and month labels
                                        const monthLabels: { label: string, colIndex: number }[] = [];
                                        let lastMonth = -1;

                                        for (let w = 0; w < weeksToRender; w++) {
                                            const weekDays = [];
                                            for (let d = 0; d < 7; d++) {
                                                const cellDate = new Date(startSunday);
                                                cellDate.setDate(startSunday.getDate() + (w * 7) + d);
                                                const dateStr = format(cellDate, "yyyy-MM-dd");
                                                const isCompleted = habit.logs.includes(dateStr);
                                                const isFuture = cellDate > today;

                                                if (d === 0) { // Check month at start of each week
                                                    const m = cellDate.getMonth();
                                                    if (m !== lastMonth) {
                                                        monthLabels.push({
                                                            label: format(cellDate, "MMM") + (cellDate.getMonth() === 0 ? ` ${cellDate.getFullYear()}` : ""),
                                                            colIndex: w
                                                        });
                                                        lastMonth = m;
                                                    }
                                                }

                                                weekDays.push({
                                                    dayNum: format(cellDate, "d"),
                                                    isCompleted,
                                                    isFuture,
                                                    date: cellDate
                                                });
                                            }
                                            weeks.push(weekDays);
                                        }

                                        return (
                                            <div className="flex flex-col">
                                                {/* Month Labels */}
                                                <div className="flex mb-2 h-4 relative">
                                                    {monthLabels.map((m, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="absolute text-[10px] font-bold text-muted-foreground uppercase tracking-tighter"
                                                            style={{ left: `${m.colIndex * 24}px` }}
                                                        >
                                                            {m.label}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    {/* The Grid */}
                                                    <div className="flex gap-[4px]">
                                                        {weeks.map((week: any[], wIndex: number) => (
                                                            <div key={wIndex} className="flex flex-col gap-[4px]">
                                                                {week.map((day: any, dIndex: number) => (
                                                                    <div
                                                                        key={`${wIndex}-${dIndex}`}
                                                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[4px] flex items-center justify-center text-[8px] sm:text-[10px] font-bold transition-all duration-300
                                                                            ${day.isFuture ? 'opacity-0' :
                                                                                day.isCompleted ? 'text-white' : 'bg-muted/20 text-muted-foreground/50'
                                                                            }`}
                                                                        style={{
                                                                            backgroundColor: day.isCompleted ? habit.color : undefined,
                                                                        }}
                                                                    >
                                                                        {!day.isFuture && day.dayNum}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Day Labels on Right */}
                                                    <div className="flex flex-col gap-[4px] pt-0">
                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                                            <div key={i} className="h-5 sm:h-6 flex items-center">
                                                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{d}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Best Streaks */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Best Streaks</h2>
                        <div className="space-y-4">
                            {bestStreaks.length > 0 ? (
                                bestStreaks.map((s: any, i: number) => (
                                    <div key={i} className="group cursor-default">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">
                                            <span>{format(parseISO(s.start), "MMM d")} - {format(parseISO(s.end), "MMM d")}</span>
                                            <span style={{ color: habit.color }}>{s.length} Days</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out delay-300"
                                                style={{
                                                    backgroundColor: habit.color,
                                                    width: `${(s.length / (bestStreaks[0].length)) * 100}%`,
                                                    opacity: 1 - (i * 0.15)
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">No streaks recorded yet</p>
                            )}
                        </div>
                    </section>

                    {/* Frequency (Bubble chart style) */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Day Frequency</h2>
                        <div className="flex justify-between items-center px-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day: string, idx: number) => {
                                const count = frequencyData[idx];
                                const size = maxFreq > 0 ? 10 + (count / maxFreq) * 30 : 10;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-3">
                                        <div className="h-12 flex items-center justify-center">
                                            <div
                                                className="rounded-full transition-all duration-500 shadow-lg"
                                                style={{
                                                    width: `${size}px`,
                                                    height: `${size}px`,
                                                    backgroundColor: count > 0 ? habit.color : 'var(--muted)',
                                                    opacity: count > 0 ? 0.3 + (count / maxFreq) * 0.7 : 0.1
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-muted-foreground">{day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
