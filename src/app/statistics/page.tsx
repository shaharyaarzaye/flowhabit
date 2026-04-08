"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft, TrendingUp, TrendingDown, Flame, Target, Calendar,
    Award, AlertTriangle, BarChart3, Activity, CheckCircle2, Zap,
    ArrowUpRight, ArrowDownRight, Clock, Star, Sparkles
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getStatistics } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignInButton, SignedOut, UserButton, SignedIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function StatisticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartView, setChartView] = useState<"daily" | "monthly">("daily");

    useEffect(() => {
        getStatistics().then((data) => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary/40" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Crunching your numbers...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-9 h-9 text-primary" />
                </div>
                <p className="text-lg font-semibold">Sign in to see your statistics</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">Your habit data is waiting. Sign in to unlock your personalized insights.</p>
                <SignInButton mode="modal">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        Sign In
                    </button>
                </SignInButton>
            </div>
        );
    }

    if (stats.totalHabits === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 flex items-center justify-center mb-2">
                    <Sparkles className="w-9 h-9 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center">Your journey starts here</h2>
                <p className="text-muted-foreground text-center max-w-sm">Create your first habit on the dashboard to start tracking and seeing your statistics.</p>
                <Link
                    href="/dashboard"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    const chartData = chartView === "daily" ? stats.last30DaysDaily : stats.monthlyTrend;
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
    const maxWeekly = Math.max(...stats.weeklyActivity, 1);

    const scorePercent = stats.overallScore;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - scorePercent / 100);
    const todayPercent = stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;

    return (
        <main className="min-h-screen max-w-6xl mx-auto py-6 px-4 sm:px-6 pb-24 bg-background text-foreground font-sans">
            {/* Header */}
            <motion.header {...fadeUp(0)} className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Statistics</span>
                        </h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Your habit insights at a glance</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <ThemeToggle />
                    <SignedIn><UserButton /></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs font-bold bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-1.5 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </motion.header>

            {/* Hero Stats Row */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {/* Overall Score */}
                <motion.div {...fadeUp(0.1)} className="col-span-2 sm:col-span-1 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-purple-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="currentColor" strokeWidth="5" className="text-muted/10" />
                            <circle
                                cx="60" cy="60" r={radius} fill="transparent"
                                stroke="url(#scoreGrad)" strokeWidth="5"
                                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round" className="transition-all duration-[1500ms] ease-out"
                            />
                            <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="50%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {scorePercent}%
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative">Overall Score</span>
                    <span className="text-[8px] text-muted-foreground/50 mt-0.5 relative">Last 30 days across all habits</span>
                </motion.div>

                {/* Today's Progress */}
                <motion.div {...fadeUp(0.15)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-emerald-500">{stats.todayCompleted}</span>
                            <span className="text-sm text-muted-foreground/60 font-medium">/ {stats.todayTotal}</span>
                        </div>
                        <div className="mt-3 h-2 bg-muted/15 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-[1200ms] ease-out"
                                style={{ width: `${todayPercent}%` }}
                            />
                        </div>
                        <span className="text-[8px] text-muted-foreground/50 mt-1.5 block font-medium">{todayPercent}% completed today</span>
                    </div>
                </motion.div>

                {/* Avg Streak */}
                <motion.div {...fadeUp(0.2)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 flex items-center justify-center">
                                <Flame className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Streak</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-amber-500">{stats.overallStreak}</span>
                            <span className="text-sm text-muted-foreground/60 font-medium">days</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 relative">
                        <Zap className="w-3 h-3 text-amber-500/40" />
                        <span className="text-[8px] text-muted-foreground/50 font-medium">Active habit average</span>
                    </div>
                </motion.div>

                {/* Total Completions */}
                <motion.div {...fadeUp(0.25)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/10 flex items-center justify-center">
                                <Target className="w-4 h-4 text-rose-500" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Logs</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-rose-500">{stats.totalCompletions.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 relative">
                        <Activity className="w-3 h-3 text-rose-500/40" />
                        <span className="text-[8px] text-muted-foreground/50 font-medium">Across {stats.totalHabits} habits</span>
                    </div>
                </motion.div>
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Activity Chart */}
                    <motion.section {...fadeUp(0.3)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.03] rounded-full blur-3xl" />
                        <div className="flex items-center justify-between mb-5 relative">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Activity Trend</h2>
                                <p className="text-[9px] text-muted-foreground/50 mt-0.5 font-medium">
                                    {chartView === "daily" ? "Daily completions — last 30 days" : "Monthly completions — last 6 months"}
                                </p>
                            </div>
                            <div className="flex bg-muted/20 p-1 rounded-xl backdrop-blur-sm border border-border/30">
                                {(["daily", "monthly"] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setChartView(v)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all duration-200 ${chartView === v
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-64 sm:h-72 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartView === "daily" ? (
                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={30} dy={10} />
                                        <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ stroke: "#818cf8", strokeWidth: 1, strokeDasharray: "5 5" }}
                                            content={({ active, payload }: any) => {
                                                if (active && payload?.length) {
                                                    return (
                                                        <div className="bg-popover/95 border border-border/50 text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                            <p className="font-bold mb-1 opacity-60 text-[10px]">{payload[0].payload.name}</p>
                                                            <p className="text-lg font-black text-primary">
                                                                {payload[0].value} <span className="text-[8px] opacity-40 uppercase font-bold">completions</span>
                                                            </p>
                                                            <p className="text-[9px] text-muted-foreground mt-0.5">{payload[0].payload.rate}% of habits</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area type="monotone" dataKey="completions" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#actGrad)" animationDuration={1200} />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: "var(--muted)", opacity: 0.08 }}
                                            content={({ active, payload }: any) => {
                                                if (active && payload?.length) {
                                                    return (
                                                        <div className="bg-popover/95 border border-border/50 text-popover-foreground text-xs rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                                                            <p className="font-bold mb-1 opacity-60 text-[10px]">{payload[0].payload.name}</p>
                                                            <p className="text-lg font-black text-primary">
                                                                {payload[0].value} <span className="text-[8px] opacity-40 uppercase font-bold">completions</span>
                                                            </p>
                                                            <p className="text-[9px] text-muted-foreground mt-0.5">{payload[0].payload.rate}% completion rate</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="completions" radius={[8, 8, 0, 0]} animationDuration={1200}>
                                            {chartData.map((_: any, index: number) => (
                                                <Cell key={index} fill="#818cf8" fillOpacity={0.75} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </motion.section>

                    {/* Habit Breakdown */}
                    <motion.section {...fadeUp(0.4)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Habit Breakdown</h2>
                                <p className="text-[9px] text-muted-foreground/50 mt-0.5 font-medium">Performance ranked by score</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground/40 font-bold">{stats.habitBreakdowns.length} habits</span>
                        </div>
                        <div className="space-y-2.5">
                            {stats.habitBreakdowns
                                .sort((a: any, b: any) => b.score - a.score)
                                .map((habit: any, i: number) => (
                                    <Link
                                        key={habit.id}
                                        href={`/habits/${habit.id}`}
                                        className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-background/30 border border-border/20 hover:border-border/50 hover:bg-background/50 transition-all duration-200 group"
                                    >
                                        {/* Rank */}
                                        <span className="text-[10px] font-black text-muted-foreground/30 w-4 text-center shrink-0">
                                            {i + 1}
                                        </span>

                                        {/* Color dot + name */}
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: habit.color }} />
                                            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{habit.name}</span>
                                        </div>

                                        {/* Score bar */}
                                        <div className="hidden sm:flex items-center gap-2 w-32">
                                            <div className="flex-1 h-2 bg-muted/15 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${habit.score}%`, backgroundColor: habit.color }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-9 text-right tabular-nums" style={{ color: habit.color }}>
                                                {habit.score}%
                                            </span>
                                        </div>

                                        {/* Streak */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Flame className="w-3 h-3 text-amber-500" />
                                            <span className="text-xs font-bold text-muted-foreground tabular-nums">{habit.streak}</span>
                                        </div>

                                        {/* Month trend */}
                                        <div className="flex items-center gap-0.5 shrink-0 w-14 justify-end">
                                            {habit.monthDelta > 0 ? (
                                                <>
                                                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-500 tabular-nums">+{habit.monthDelta}%</span>
                                                </>
                                            ) : habit.monthDelta < 0 ? (
                                                <>
                                                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                                                    <span className="text-[10px] font-bold text-red-500 tabular-nums">{habit.monthDelta}%</span>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/30">—</span>
                                            )}
                                        </div>

                                        {/* Mobile score */}
                                        <span className="sm:hidden text-xs font-bold tabular-nums" style={{ color: habit.color }}>
                                            {habit.score}%
                                        </span>
                                    </Link>
                                ))}
                        </div>
                    </motion.section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Weekly Pattern */}
                    <motion.section {...fadeUp(0.35)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/[0.04] rounded-full blur-2xl" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5 relative">Weekly Pattern</h2>
                        <div className="flex justify-between items-end gap-1.5 px-1 mb-4 relative" style={{ height: "100px" }}>
                            {weekDays.map((day, idx) => {
                                const count = stats.weeklyActivity[idx];
                                const height = maxWeekly > 0 ? Math.max(8, (count / maxWeekly) * 100) : 8;
                                const isMax = count === maxWeekly && count > 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
                                            <span className="text-[8px] font-bold text-muted-foreground/60 mb-1 tabular-nums">{count}</span>
                                            <div
                                                className="w-full max-w-[28px] rounded-lg transition-all duration-700 ease-out"
                                                style={{
                                                    height: `${height}%`,
                                                    background: isMax
                                                        ? "linear-gradient(180deg, #818cf8 0%, #a78bfa 100%)"
                                                        : "var(--muted)",
                                                    opacity: count > 0 ? 0.3 + (count / maxWeekly) * 0.7 : 0.08,
                                                }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-black ${isMax ? "text-primary" : "text-muted-foreground/50"}`}>
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between pt-3 border-t border-border/20 relative">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-emerald-500" />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    Best: <span className="font-bold text-foreground">{stats.bestDay}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-md bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="w-2.5 h-2.5 text-amber-500" />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    Weak: <span className="font-bold text-foreground">{stats.worstDay}</span>
                                </span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Top Performer */}
                    {stats.topHabit && (
                        <motion.div {...fadeUp(0.45)}>
                            <Link href={`/habits/${stats.topHabit.id}`}>
                                <section className="bg-gradient-to-br from-primary/[0.08] via-purple-500/[0.04] to-pink-500/[0.02] border border-primary/20 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                                    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/15 flex items-center justify-center">
                                                <Award className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Top Performer</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{stats.topHabit.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl font-black" style={{ color: stats.topHabit.color }}>{stats.topHabit.score}%</span>
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold">score</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-sm font-bold tabular-nums">{stats.topHabit.streak}</span>
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold">streak</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Link>
                        </motion.div>
                    )}

                    {/* Needs Attention */}
                    {stats.needsAttention && (
                        <motion.div {...fadeUp(0.5)}>
                            <Link href={`/habits/${stats.needsAttention.id}`}>
                                <section className="bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-red-500/[0.02] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer">
                                    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/15 flex items-center justify-center">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/60">Needs Attention</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-amber-500 transition-colors">{stats.needsAttention.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl font-black text-amber-500">{stats.needsAttention.score}%</span>
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold">score</span>
                                            </div>
                                            {stats.needsAttention.monthDelta < 0 && (
                                                <div className="flex items-center gap-0.5">
                                                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                                    <span className="text-xs font-bold text-red-500 tabular-nums">{stats.needsAttention.monthDelta}%</span>
                                                    <span className="text-[8px] text-muted-foreground font-bold">this month</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </Link>
                        </motion.div>
                    )}

                    {/* Quick Facts */}
                    <motion.section {...fadeUp(0.55)} className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Facts</h2>
                        <div className="space-y-2.5">
                            {[
                                { icon: BarChart3, label: "Total Habits", value: stats.totalHabits, color: "" },
                                { icon: Calendar, label: "All-time Completions", value: stats.totalCompletions.toLocaleString(), color: "" },
                                { icon: Star, label: "Best Day", value: stats.bestDay, color: "text-emerald-500" },
                                { icon: AlertTriangle, label: "Weakest Day", value: stats.worstDay, color: "text-amber-500" },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center justify-between py-2 ${i < 3 ? 'border-b border-border/15' : ''}`}>
                                    <div className="flex items-center gap-2.5">
                                        <item.icon className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>
        </main>
    );
}
