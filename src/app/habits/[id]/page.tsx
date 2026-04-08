"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, Hash, TrendingUp, TrendingDown, Info,
    Flame, Check, Trash2, Edit2, X, Save, Trophy,
    Calendar, Target, Lightbulb, ArrowUpRight, ArrowDownRight,
    Sparkles
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getHabitDetails, toggleHabitCompletion, deleteHabit, updateHabit } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { format, parseISO, differenceInDays } from "date-fns";
import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

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

    let streak = 0;
    if (completedSet.has(todayStr)) {
        streak = 1;
        let d = new Date(today);
        d.setDate(d.getDate() - 1);
        while (completedSet.has(format(d, "yyyy-MM-dd"))) { streak++; d.setDate(d.getDate() - 1); }
    } else if (completedSet.has(yesterdayStr)) {
        streak = 1;
        let d = new Date(yesterday);
        d.setDate(d.getDate() - 1);
        while (completedSet.has(format(d, "yyyy-MM-dd"))) { streak++; d.setDate(d.getDate() - 1); }
    }

    const streaks: any[] = [];
    if (logs.length > 0) {
        let start = logs[0], end = logs[0], length = 1;
        for (let i = 1; i < logs.length; i++) {
            if (differenceInDays(parseISO(logs[i]), parseISO(logs[i - 1])) === 1) {
                length++; end = logs[i];
            } else {
                streaks.push({ start, end, length });
                start = logs[i]; end = logs[i]; length = 1;
            }
        }
        streaks.push({ start, end, length });
    }
    const sortedStreaks = streaks.sort((a, b) => b.length - a.length).slice(0, 5);

    let last30DaysCount = 0;
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    logs.forEach(d => { if (new Date(d) >= thirtyDaysAgo) last30DaysCount++; });
    const score = Math.min(100, Math.round((last30DaysCount / 30) * 100));

    const currentMonth = today.getMonth(), currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let currentMonthCount = 0;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth(), prevMonthYear = prevMonthDate.getFullYear();
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    let prevMonthCount = 0;

    logs.forEach(d => {
        const date = parseISO(d);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) currentMonthCount++;
        if (date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear) prevMonthCount++;
    });
    const monthScore = Math.round((currentMonthCount / daysInMonth) * 100);
    const prevMonthScore = Math.round((prevMonthCount / daysInPrevMonth) * 100);
    const monthDelta = monthScore - prevMonthScore;

    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = differenceInDays(today, startOfYear) + 1;
    let currentYearCount = 0;
    const prevYear = currentYear - 1;
    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const daysInPrevYear = isLeapYear(prevYear) ? 366 : 365;
    let prevYearCount = 0;
    logs.forEach(d => {
        const date = parseISO(d);
        if (date.getFullYear() === currentYear) currentYearCount++;
        if (date.getFullYear() === prevYear) prevYearCount++;
    });
    const yearScore = Math.round((currentYearCount / dayOfYear) * 100);
    const prevYearScore = Math.round((prevYearCount / daysInPrevYear) * 100);
    const yearDelta = yearScore - prevYearScore;

    const frequencyStats = [0, 0, 0, 0, 0, 0, 0];
    logs.forEach(d => { frequencyStats[parseISO(d).getDay()]++; });

    const historyMap: Record<string, number> = {};
    logs.forEach(d => { const key = format(parseISO(d), "MMM"); historyMap[key] = (historyMap[key] || 0) + 1; });
    const historyStats = Object.entries(historyMap).map(([name, total]) => ({ name, total }));

    const rollingScoreHistory = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        let windowCompletions = 0;
        const windowStart = new Date(d); windowStart.setDate(windowStart.getDate() - 29);
        logs.forEach(cds => { const cd = parseISO(cds); if (cd >= windowStart && cd <= d) windowCompletions++; });
        rollingScoreHistory.push({ name: format(d, "MMM dd"), score: Math.min(100, Math.round((windowCompletions / 30) * 100)), date: d });
    }

    const earliestLog = logs.length > 0 ? parseISO(logs[0]) : today;
    const daysActive = Math.max(1, differenceInDays(today, earliestLog) + 1);
    const successRate = Math.round((logs.length / daysActive) * 100);

    return {
        ...habit, logs, streak, score, monthScore, monthDelta, yearScore, yearDelta,
        totalCompletions: logs.length, bestStreaks: sortedStreaks, frequencyStats,
        historyStats, rollingScoreHistory, successRate
    };
}

// Insight generator
function getInsight(habit: any): { icon: any; text: string; type: 'success' | 'warning' | 'tip' } {
    if (!habit) return { icon: Lightbulb, text: "Start tracking to see insights!", type: 'tip' };

    const score = habit.score || 0;
    const streak = habit.streak || 0;
    const monthDelta = habit.monthDelta || 0;
    const bestStreak = habit.bestStreaks?.[0]?.length || 0;
    const freqs = habit.frequencyStats || [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weakestDay = dayNames[freqs.indexOf(Math.min(...freqs))];
    const strongestDay = dayNames[freqs.indexOf(Math.max(...freqs))];

    if (score >= 80 && streak >= 7) {
        return { icon: Trophy, text: `Amazing! You're on a ${streak}-day streak with ${score}% score. You're building a powerful habit!`, type: 'success' };
    }
    if (monthDelta > 15) {
        return { icon: TrendingUp, text: `Great momentum! You're up ${monthDelta}% this month compared to last. Keep it going!`, type: 'success' };
    }
    if (streak > 0 && streak < bestStreak) {
        return { icon: Flame, text: `Your best streak was ${bestStreak} days. You're at ${streak} now — ${bestStreak - streak} more to beat your record!`, type: 'tip' };
    }
    if (monthDelta < -10) {
        return { icon: TrendingDown, text: `You've dropped ${Math.abs(monthDelta)}% this month. Try focusing on ${weakestDay}s — that's your weakest day.`, type: 'warning' };
    }
    if (score < 30 && habit.totalCompletions > 5) {
        return { icon: Target, text: `Your score is ${score}%. Try a "never miss twice" rule — if you skip a day, make sure you do it the next.`, type: 'warning' };
    }
    if (score >= 50) {
        return { icon: Sparkles, text: `You're most consistent on ${strongestDay}s. Try to replicate that energy on ${weakestDay}s too!`, type: 'tip' };
    }
    return { icon: Lightbulb, text: `Start small — even 2 minutes counts. Consistency matters more than intensity.`, type: 'tip' };
}


export default function HabitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [habit, setHabit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scoreFilter, setScoreFilter] = useState<'week' | 'month' | 'year'>('month');
    const [historyFilter, setHistoryFilter] = useState<'week' | 'month' | 'year'>('month');

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [saving, setSaving] = useState(false);

    // Today toggle
    const [toggling, setToggling] = useState(false);

    const habitId = Array.isArray(params.id) ? params.id[0] : params.id;

    const fetchHabit = useCallback(async () => {
        if (!habitId) return;
        const data = await getHabitDetails(habitId);
        if (data) {
            setHabit(data);
        } else {
            const stored = localStorage.getItem("localHabits");
            if (stored) {
                const found = JSON.parse(stored).find((h: any) => h.id === habitId);
                if (found) setHabit(processLocalStats(found));
            }
        }
        setLoading(false);
    }, [habitId]);

    useEffect(() => { fetchHabit(); }, [fetchHabit]);

    const handleToggleToday = async () => {
        if (!habit || toggling) return;
        setToggling(true);
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const isCompletedToday = habit.logs?.includes(todayStr);

        let value: number | undefined;
        if (!isCompletedToday && habit.type === "quantitative") {
            const val = prompt(`Enter value for ${habit.unit || 'completion'} (Goal: ${habit.goalValue})`, habit.goalValue?.toString());
            if (val === null) { setToggling(false); return; }
            value = parseInt(val) || 0;
        }

        await toggleHabitCompletion(habitId!, todayStr, !isCompletedToday, value);
        await fetchHabit();
        setToggling(false);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this habit? This action cannot be undone.")) return;
        await deleteHabit(habitId!);
        router.replace("/dashboard");
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        await updateHabit(habitId!, editName, habit.color, editDesc, habit.type, habit.goalValue, habit.unit);
        await fetchHabit();
        setIsEditing(false);
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading habit data...</p>
            </div>
        </div>
    );

    if (!habit) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <Target className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Habit not found</p>
            <button onClick={() => router.replace("/dashboard")} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                Back to Dashboard
            </button>
        </div>
    );

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isCompletedToday = habit.logs?.includes(todayStr);
    const insight = getInsight(habit);

    const getFilteredScoreData = () => {
        if (!habit.rollingScoreHistory) return [];
        const days = scoreFilter === 'week' ? 7 : scoreFilter === 'month' ? 30 : 365;
        return habit.rollingScoreHistory.slice(-days);
    };

    const getFilteredHistoryData = () => {
        if (!habit.historyStats) return [];
        if (historyFilter === 'month') return habit.historyStats;
        if (historyFilter === 'week') {
            const last7 = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                return format(d, "yyyy-MM-dd");
            });
            const weekMap: Record<string, number> = {};
            last7.forEach(dStr => { weekMap[format(parseISO(dStr), "EEE")] = habit.logs.includes(dStr) ? 1 : 0; });
            return Object.entries(weekMap).map(([name, total]) => ({ name, total }));
        }
        const yearMap: Record<string, number> = {};
        habit.logs.forEach((d: string) => { const y = format(parseISO(d), "yyyy"); yearMap[y] = (yearMap[y] || 0) + 1; });
        return Object.entries(yearMap).map(([name, total]) => ({ name, total }));
    };

    const scoreData = getFilteredScoreData();
    const historyData = getFilteredHistoryData();
    const frequencyData = habit.frequencyStats || [0, 0, 0, 0, 0, 0, 0];
    const maxFreq = Math.max(...frequencyData, 1);
    const bestStreaks = habit.bestStreaks || [];

    // Score ring
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const scorePct = habit.score || 0;
    const strokeDashoffset = circumference * (1 - scorePct / 100);

    return (
        <main className="min-h-screen max-w-6xl mx-auto py-6 px-4 sm:px-6 pb-24 bg-background text-foreground font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2 items-center">
                    <ThemeToggle />
                    <SignedIn><UserButton /></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">Sign In</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                {/* Edit Mode */}
                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card/50 border border-border/50 rounded-2xl p-5 mb-6 backdrop-blur-sm"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Edit Habit</h3>
                            <div className="space-y-3">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Habit name"
                                    autoFocus
                                />
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    rows={2}
                                    placeholder="Description (optional)"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-medium transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Habit Title Card */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Habit Details</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1">{habit.name}</h1>
                        <p className="text-sm text-muted-foreground mb-3">{habit.description || "Track your consistency and build momentum."}</p>
                        {habit.type === "quantitative" && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/50 mb-3">
                                <Hash className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Goal: {habit.goalValue} {habit.unit}</span>
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleToday}
                                disabled={toggling}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${isCompletedToday
                                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25"
                                        : "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                    }`}
                                style={!isCompletedToday ? { backgroundColor: habit.color } : {}}
                            >
                                {toggling ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                ) : isCompletedToday ? (
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {isCompletedToday ? "Done Today" : "Mark Complete"}
                            </motion.button>
                            <button
                                onClick={() => { setEditName(habit.name); setEditDesc(habit.description || ""); setIsEditing(true); }}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border border-border/50 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border border-border/50 rounded-xl text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Right: Streak Circle */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative group">
                            <div className="absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-all duration-1000" style={{ backgroundColor: habit.color + "33" }} />
                            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r={radius} fill="transparent" stroke="currentColor" strokeWidth="5" className="text-muted/15" />
                                    <circle
                                        cx="60" cy="60" r={radius} fill="transparent"
                                        stroke={habit.color} strokeWidth="5"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl sm:text-4xl font-black" style={{ color: habit.color }}>{habit.streak}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Day Streak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Insight Banner */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`mb-8 rounded-2xl p-4 flex items-start gap-3 border ${insight.type === 'success'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : insight.type === 'warning'
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-primary/5 border-primary/20'
                    }`}
            >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${insight.type === 'success'
                        ? 'bg-emerald-500/15'
                        : insight.type === 'warning'
                            ? 'bg-amber-500/15'
                            : 'bg-primary/15'
                    }`}>
                    <insight.icon className={`w-4 h-4 ${insight.type === 'success' ? 'text-emerald-500' : insight.type === 'warning' ? 'text-amber-500' : 'text-primary'
                        }`} />
                </div>
                <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${insight.type === 'success' ? 'text-emerald-500/70' : insight.type === 'warning' ? 'text-amber-500/70' : 'text-primary/70'
                        }`}>
                        {insight.type === 'success' ? '🎉 Great Work' : insight.type === 'warning' ? '⚠️ Heads Up' : '💡 Tip'}
                    </span>
                    <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{insight.text}</p>
                </div>
            </motion.section>

            {/* Stats Overview Row */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            >
                <div className="bg-card/30 border border-border/50 rounded-2xl p-4 text-center group hover:border-primary/20 transition-all">
                    <div className="text-2xl font-black" style={{ color: habit.color }}>{scorePct}%</div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-4 text-center group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-black">{habit.monthDelta > 0 ? '+' : ''}{habit.monthDelta}%</span>
                        {habit.monthDelta >= 0
                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            : <ArrowDownRight className="w-4 h-4 text-red-500" />
                        }
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Month</span>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-4 text-center group hover:border-amber-500/20 transition-all">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-black">{habit.yearDelta > 0 ? '+' : ''}{habit.yearDelta}%</span>
                        {habit.yearDelta >= 0
                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            : <ArrowDownRight className="w-4 h-4 text-red-500" />
                        }
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Year</span>
                </div>
                <div className="bg-card/30 border border-border/50 rounded-2xl p-4 text-center group hover:border-rose-500/20 transition-all">
                    <div className="text-2xl font-black text-rose-500">{habit.successRate || 0}%</div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Success Rate</span>
                </div>
            </motion.section>

            {/* Desktop Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Score Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5 sm:p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
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
                        <div className="h-64 sm:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={scoreData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={habit.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={habit.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} dy={10} minTickGap={scoreFilter === 'year' ? 60 : 20} />
                                    <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        cursor={{ stroke: habit.color, strokeWidth: 1, strokeDasharray: '5 5' }}
                                        content={({ active, payload }: any) => {
                                            if (active && payload?.length) {
                                                return (
                                                    <div className="bg-popover/90 border border-border text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                        <p className="font-bold mb-1 opacity-70">{payload[0].payload.name}</p>
                                                        <p className="text-lg font-black" style={{ color: habit.color }}>{payload[0].value}% <span className="text-[8px] opacity-50 uppercase">Score</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke={habit.color} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" animationDuration={1200} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>

                    {/* History Chart */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5 sm:p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
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
                        <div className="h-64 sm:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                        content={({ active, payload }: any) => {
                                            if (active && payload?.length) {
                                                const label = historyFilter === 'week' ? "Status" : "Logs";
                                                const val = historyFilter === 'week' ? (payload[0].value === 1 ? "Completed" : "Not Done") : payload[0].value;
                                                return (
                                                    <div className="bg-popover/90 border border-border text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                        <p className="font-bold mb-1 opacity-70">{payload[0].payload.name}</p>
                                                        <p className="text-lg font-black" style={{ color: habit.color }}>{val} <span className="text-[8px] opacity-50 uppercase">{label}</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="total" radius={[6, 6, 0, 0]} animationDuration={1200}>
                                        {historyData.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={habit.color} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Log — Last 7 Days */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Last 7 Days</h2>
                        <div className="flex justify-between gap-1">
                            {Array.from({ length: 7 }, (_, i) => {
                                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                                const dStr = format(d, "yyyy-MM-dd");
                                const done = habit.logs?.includes(dStr);
                                const isToday = i === 6;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(d, "EEE")}</span>
                                        <div
                                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${done ? 'text-white shadow-sm' :
                                                    isToday ? 'border-2 border-dashed text-muted-foreground' : 'bg-muted/20 text-muted-foreground/40'
                                                }`}
                                            style={{
                                                backgroundColor: done ? habit.color : undefined,
                                                borderColor: isToday && !done ? habit.color + '50' : undefined,
                                            }}
                                        >
                                            {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : format(d, "d")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* Calendar Heatmap */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5 overflow-hidden"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Calendar</h2>
                        <div className="overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                            <div className="inline-block min-w-full align-middle">
                                {(() => {
                                    const today = new Date();
                                    const weeksToRender = 16;
                                    const weeks: any[][] = [];
                                    const lastSunday = new Date(today);
                                    lastSunday.setDate(today.getDate() - today.getDay());
                                    const startSunday = new Date(lastSunday);
                                    startSunday.setDate(lastSunday.getDate() - ((weeksToRender - 1) * 7));
                                    const monthLabels: { label: string; colIndex: number }[] = [];
                                    let lastMonth = -1;

                                    for (let w = 0; w < weeksToRender; w++) {
                                        const weekDays = [];
                                        for (let d = 0; d < 7; d++) {
                                            const cellDate = new Date(startSunday);
                                            cellDate.setDate(startSunday.getDate() + (w * 7) + d);
                                            const dateStr = format(cellDate, "yyyy-MM-dd");
                                            const isCompleted = habit.logs?.includes(dateStr);
                                            const isFuture = cellDate > today;
                                            if (d === 0) {
                                                const m = cellDate.getMonth();
                                                if (m !== lastMonth) {
                                                    monthLabels.push({ label: format(cellDate, "MMM"), colIndex: w });
                                                    lastMonth = m;
                                                }
                                            }
                                            weekDays.push({ dayNum: format(cellDate, "d"), isCompleted, isFuture });
                                        }
                                        weeks.push(weekDays);
                                    }
                                    return (
                                        <div className="flex flex-col">
                                            <div className="flex mb-1.5 h-4 relative" style={{ width: `${weeksToRender * 22}px` }}>
                                                {monthLabels.map((m, idx) => (
                                                    <span key={idx} className="absolute text-[9px] font-bold text-muted-foreground uppercase tracking-tighter" style={{ left: `${m.colIndex * 22}px` }}>
                                                        {m.label}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-[3px]">
                                                {weeks.map((week, wIndex) => (
                                                    <div key={wIndex} className="flex flex-col gap-[3px]">
                                                        {week.map((day: any, dIndex: number) => (
                                                            <div
                                                                key={`${wIndex}-${dIndex}`}
                                                                className={`w-[18px] h-[18px] rounded-[3px] transition-all duration-300 ${day.isFuture ? 'opacity-0' :
                                                                        day.isCompleted ? '' : 'bg-muted/15'
                                                                    }`}
                                                                style={{ backgroundColor: day.isCompleted ? habit.color : undefined }}
                                                                title={day.isFuture ? '' : `${day.isCompleted ? '✓' : '✗'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.section>

                    {/* Best Streaks */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Best Streaks</h2>
                        <div className="space-y-3">
                            {bestStreaks.length > 0 ? (
                                bestStreaks.map((s: any, i: number) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">
                                            <span>{format(parseISO(s.start), "MMM d")} — {format(parseISO(s.end), "MMM d")}</span>
                                            <span style={{ color: habit.color }}>{s.length}d</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted/15 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    backgroundColor: habit.color,
                                                    width: `${(s.length / bestStreaks[0].length) * 100}%`,
                                                    opacity: 1 - (i * 0.15)
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">Complete days consecutively to build streaks</p>
                            )}
                        </div>
                    </motion.section>

                    {/* Day Frequency */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Day Frequency</h2>
                        <div className="flex justify-between items-end px-1" style={{ height: '70px' }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                const count = frequencyData[idx];
                                const height = maxFreq > 0 ? Math.max(8, (count / maxFreq) * 100) : 8;
                                const isMax = count === maxFreq && count > 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '50px' }}>
                                            <div
                                                className="w-full max-w-[24px] rounded-md transition-all duration-500"
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: isMax ? habit.color : 'var(--muted)',
                                                    opacity: count > 0 ? 0.3 + (count / maxFreq) * 0.7 : 0.1
                                                }}
                                            />
                                        </div>
                                        <span className={`text-[9px] font-black ${isMax ? '' : 'text-muted-foreground'}`} style={isMax ? { color: habit.color } : {}}>
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* Quick Facts */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-5"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Facts</h2>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    <span className="text-xs text-muted-foreground">Total Completions</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: habit.color }}>{habit.totalCompletions}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    <span className="text-xs text-muted-foreground">Best Streak</span>
                                </div>
                                <span className="text-sm font-bold">{bestStreaks[0]?.length || 0} days</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    <span className="text-xs text-muted-foreground">Month Score</span>
                                </div>
                                <span className="text-sm font-bold">{habit.monthScore}%</span>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </main>
    );
}
