"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
    Zap,
    Target,
    TrendingUp,
    Calendar,
    BarChart3,
    Shield,
    ChevronRight,
    Star,
    Check,
    ArrowRight,
    Sparkles,
    Clock,
    Award,
    Menu,
    X,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── Animated Counter ───────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

// ─── Floating Orbs Background ───────────────────────────────────
function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
                style={{
                    background: "radial-gradient(circle, #818cf8 0%, transparent 70%)",
                    top: "-10%",
                    right: "-10%",
                }}
                animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
                style={{
                    background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
                    bottom: "10%",
                    left: "-5%",
                }}
                animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
                style={{
                    background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
                    top: "40%",
                    left: "50%",
                }}
                animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// ─── Animated Grid Pattern ──────────────────────────────────────
function GridPattern() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.06]">
            <div
                className="w-full h-full"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />
        </div>
    );
}

// ─── Habit Mockup UI ────────────────────────────────────────────
function HabitMockup() {
    const habits = [
        { name: "Morning Meditation", color: "#818cf8", streak: 12, completed: true },
        { name: "Read 30 minutes", color: "#34d399", streak: 8, completed: true },
        { name: "Exercise", color: "#f472b6", streak: 5, completed: false },
        { name: "Drink 2L Water", color: "#fbbf24", streak: 15, completed: true },
    ];

    const days = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <motion.div
            className="relative w-full max-w-[360px] mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
        >
            {/* Phone-like frame with glassmorphism */}
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-b from-white/20 to-white/5 dark:from-white/10 dark:to-white/[0.02]">
                <div className="rounded-[2rem] bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/50 p-5 space-y-4 shadow-2xl shadow-primary/10">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2">
                        <div>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Today</p>
                            <p className="text-lg font-display font-bold text-foreground">My Habits</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Mini Week Calendar */}
                    <div className="flex gap-1.5 justify-between">
                        {days.map((day, i) => (
                            <motion.div
                                key={day + i}
                                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all ${i === 3
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-muted-foreground"
                                    }`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                            >
                                <span>{day}</span>
                                <span className="text-[9px] opacity-70">{10 + i}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Habit List */}
                    <div className="space-y-2.5">
                        {habits.map((habit, i) => (
                            <motion.div
                                key={habit.name}
                                className="flex items-center gap-3 p-3 rounded-xl bg-background/50 dark:bg-background/30 border border-border/30 group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            >
                                <motion.div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${habit.completed ? "scale-100" : "scale-100"
                                        }`}
                                    style={{
                                        background: habit.completed
                                            ? habit.color
                                            : "transparent",
                                        border: habit.completed ? "none" : `2px solid ${habit.color}40`,
                                    }}
                                    whileTap={{ scale: 0.85 }}
                                >
                                    {habit.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Zap className="w-2.5 h-2.5" style={{ color: habit.color }} />
                                        {habit.streak} day streak
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Score bar */}
                    <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Today&apos;s Progress</span>
                            <span className="font-semibold text-foreground">75%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400"
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating decorative elements */}
            <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border border-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 5, 0], y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <TrendingUp className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.div
                className="absolute -bottom-3 -left-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/10 flex items-center justify-center"
                animate={{ rotate: [0, -5, 0], y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Award className="w-7 h-7 text-emerald-500" />
            </motion.div>
        </motion.div>
    );
}

// ─── Feature Card ───────────────────────────────────────────────
function FeatureCard({
    icon: Icon,
    title,
    description,
    gradient,
    delay,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
    delay: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            className="group relative p-6 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
        >
            <div
                className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </motion.div>
    );
}

// ─── Step Card ──────────────────────────────────────────────────
function StepCard({
    number,
    title,
    description,
    delay,
}: {
    number: string;
    title: string;
    description: string;
    delay: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            className="relative text-center group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-display font-bold text-white">{number}</span>
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{description}</p>
        </motion.div>
    );
}

// ─── Testimonial Card ───────────────────────────────────────────
function TestimonialCard({
    name,
    role,
    content,
    rating,
    delay,
}: {
    name: string;
    role: string;
    content: string;
    rating: number;
    delay: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            className="p-6 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex gap-1 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{content}&rdquo;</p>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {name[0]}
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{role}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ════════════════════════════════════════════════════════════════
// ─── MAIN LANDING PAGE ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const headerBg = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

    // ─── Features Data ──────────────────────────────────────────
    const features = [
        {
            icon: Target,
            title: "Smart Habit Tracking",
            description:
                "Track both yes/no habits and quantitative goals like water intake or reading pages. Flexible enough for any routine.",
            gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
        },
        {
            icon: Zap,
            title: "Streak Tracking",
            description:
                "Build momentum with visible streaks. Watch your consistency grow as you build unbreakable chains of daily wins.",
            gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        },
        {
            icon: BarChart3,
            title: "Habit Scoring",
            description:
                "Get an intuitive score for each habit based on your completion rate. Know exactly where you stand at a glance.",
            gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
        },
        {
            icon: Calendar,
            title: "Calendar View",
            description:
                "Visualize your progress with a beautiful calendar heatmap. See your patterns emerge over weeks and months.",
            gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
        },
        {
            icon: Shield,
            title: "Cloud Sync",
            description:
                "Your habits are securely synced across all devices. Sign in and pick up right where you left off, anywhere.",
            gradient: "bg-gradient-to-br from-sky-500 to-blue-600",
        },
        {
            icon: Sparkles,
            title: "Beautiful Design",
            description:
                "A minimalist interface with dark mode, smooth animations, and attention to every detail. Tracking should feel good.",
            gradient: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
        },
    ];

    // ─── Testimonials Data ──────────────────────────────────────
    const testimonials = [
        {
            name: "Arjun Mehta",
            role: "Software Engineer",
            content:
                "FlowHabit made tracking habits effortless. The streaks keep me motivated and the design is so clean I actually enjoy opening it every day.",
            rating: 5,
        },
        {
            name: "Priya Sharma",
            role: "Content Creator",
            content:
                "I've tried dozens of habit trackers. FlowHabit nails the balance between simplicity and functionality. The quantitative tracking is a game-changer.",
            rating: 5,
        },
        {
            name: "Rahul K",
            role: "Fitness Coach",
            content:
                "My clients love how simple it is. The scoring system gives them clear visibility into their consistency. Highly recommend!",
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
            {/* ─── Navbar ──────────────────────────────────────────── */}
            <motion.header
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    backgroundColor: `rgba(var(--background-rgb, 250,250,250), ${headerBg})`,
                    backdropFilter: `blur(${headerBg.get() > 0.5 ? 12 : 0}px)`,
                }}
            >
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
                <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            FlowHabit
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            How It Works
                        </a>
                        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </a>
                        <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Reviews
                        </a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                                    Get Started Free
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                            >
                                Dashboard
                            </Link>
                            <UserButton />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-2xl"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-4 space-y-3">
                                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground transition-colors">Features</a>
                                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
                                <div className="pt-3 flex flex-col gap-2">
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 rounded-xl border border-border/50">Sign In</button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <button className="w-full text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white py-2.5 rounded-xl">Get Started Free</button>
                                        </SignUpButton>
                                    </SignedOut>
                                    <SignedIn>
                                        <Link href="/dashboard" className="w-full text-center text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white py-2.5 rounded-xl block">Dashboard</Link>
                                    </SignedIn>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* ─── Hero Section ────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
                <FloatingOrbs />
                <GridPattern />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* Left - Copy */}
                        <div className="text-center lg:text-left">
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Minimalist Habit Tracking
                            </motion.div>

                            <motion.h1
                                className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.1] tracking-tight mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Build Better Habits.{" "}
                                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    Transform Your Life.
                                </span>
                            </motion.h1>

                            <motion.p
                                className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                The beautifully simple habit tracker that helps you stay consistent, build streaks, and achieve your goals — one day at a time.
                            </motion.p>

                            <motion.div
                                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <SignedOut>
                                    <SignUpButton mode="modal">
                                        <button className="group inline-flex items-center justify-center gap-2 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98]">
                                            Start Tracking — It&apos;s Free
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link
                                        href="/dashboard"
                                        className="group inline-flex items-center justify-center gap-2 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </SignedIn>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center gap-2 text-base font-medium text-muted-foreground px-6 py-3.5 rounded-2xl border border-border/50 hover:border-primary/30 hover:text-foreground transition-all"
                                >
                                    See Features
                                    <ChevronRight className="w-4 h-4" />
                                </a>
                            </motion.div>

                            {/* Social Proof */}
                            <motion.div
                                className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <div className="flex -space-x-2">
                                    {["#818cf8", "#34d399", "#f472b6", "#fbbf24"].map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                                            style={{ background: color, zIndex: 4 - i }}
                                        >
                                            {["A", "P", "R", "S"][i]}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Loved by <span className="font-semibold text-foreground">2,000+</span> habit builders
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right - Mockup */}
                        <div className="flex justify-center lg:justify-end">
                            <HabitMockup />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ───────────────────────────────────────── */}
            <section className="relative border-y border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Active Users", value: 2000, suffix: "+" },
                            { label: "Habits Tracked", value: 50000, suffix: "+" },
                            { label: "Completions", value: 250000, suffix: "+" },
                            { label: "Avg Streak", value: 14, suffix: " days" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <p className="text-3xl sm:text-4xl font-display font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features Section ────────────────────────────────── */}
            <section id="features" className="relative py-24 lg:py-32">
                <GridPattern />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                            Features
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display font-black mb-4">
                            Everything you need to{" "}
                            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                stay on track
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Powerful features wrapped in a minimal interface. No clutter, no distractions — just what you need.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => (
                            <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ────────────────────────────────────── */}
            <section id="how-it-works" className="relative py-24 lg:py-32 bg-card/30 border-y border-border/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                            How It Works
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display font-black mb-4">
                            Three steps to a{" "}
                            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                better you
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Getting started takes less than 30 seconds. No complex setup, no learning curve.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10 relative">
                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                        <StepCard
                            number="1"
                            title="Create Your Habits"
                            description="Add the habits you want to build. Choose between simple check-off or quantitative tracking with custom goals."
                            delay={0}
                        />
                        <StepCard
                            number="2"
                            title="Track Daily"
                            description="Check off your habits each day with a single tap. Watch your streaks grow and your score rise."
                            delay={0.15}
                        />
                        <StepCard
                            number="3"
                            title="See Your Growth"
                            description="Review your progress with calendar views and habit scores. Celebrate your consistency and keep improving."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ─── Pricing Section ─────────────────────────────────── */}
            <section id="pricing" className="relative py-24 lg:py-32">
                <FloatingOrbs />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                            Pricing
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display font-black mb-4">
                            Simple,{" "}
                            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                transparent pricing
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Start free. Upgrade once when you&apos;re ready for unlimited habits — no subscriptions.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Free Plan */}
                        <motion.div
                            className="p-7 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 flex flex-col"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="mb-6">
                                <h3 className="text-lg font-display font-bold mb-1">Free</h3>
                                <p className="text-muted-foreground text-sm">Perfect to get started</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-display font-black">₹0</span>
                                <span className="text-muted-foreground text-sm ml-1">forever</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    "Up to 4 habits",
                                    "Daily tracking & streaks",
                                    "Habit scoring",
                                    "Calendar view",
                                    "Dark mode",
                                    "Cloud sync",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="w-full py-3 rounded-xl border border-border font-semibold text-sm hover:border-primary/30 hover:text-primary transition-all">
                                        Get Started
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/dashboard"
                                    className="w-full py-3 rounded-xl border border-border font-semibold text-sm hover:border-primary/30 hover:text-primary transition-all block text-center"
                                >
                                    Go to Dashboard
                                </Link>
                            </SignedIn>
                        </motion.div>

                        {/* Premium Plan */}
                        <motion.div
                            className="relative p-7 rounded-2xl bg-gradient-to-b from-primary/[0.08] to-transparent border border-primary/30 flex flex-col overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider">
                                    Popular
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-display font-bold mb-1">Premium</h3>
                                <p className="text-muted-foreground text-sm">One-time payment, lifetime access</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-display font-black">₹99</span>
                                <span className="text-muted-foreground text-sm ml-1">one-time</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {[
                                    "Unlimited habits",
                                    "Everything in Free",
                                    "Priority support",
                                    "Early access to features",
                                    "Lifetime updates",
                                    "Support development",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold text-sm hover:shadow-xl hover:shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Get Started &amp; Upgrade
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/dashboard"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold text-sm hover:shadow-xl hover:shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] block text-center"
                                >
                                    Upgrade Now
                                </Link>
                            </SignedIn>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ────────────────────────────────────── */}
            <section id="testimonials" className="relative py-24 lg:py-32 bg-card/30 border-y border-border/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display font-black mb-4">
                            What our users{" "}
                            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                are saying
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {testimonials.map((testimonial, i) => (
                            <TestimonialCard key={testimonial.name} {...testimonial} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ───────────────────────────────────────── */}
            <section className="relative py-24 lg:py-32">
                <FloatingOrbs />
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/25">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black mb-5">
                            Ready to build habits that{" "}
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                actually stick?
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                            Join thousands of people who are transforming their daily routines with FlowHabit. Start today — it&apos;s free.
                        </p>
                        <SignedOut>
                            <SignUpButton mode="modal">
                                <button className="group inline-flex items-center justify-center gap-2 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 text-white px-10 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98]">
                                    Start Your Journey — Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="group inline-flex items-center justify-center gap-2 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 text-white px-10 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </SignedIn>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────────── */}
            <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-display font-bold">FlowHabit</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                The minimalist habit tracker designed to help you build consistency and transform your daily routines.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Product</h4>
                            <ul className="space-y-2.5">
                                {["Features", "Pricing", "Reviews"].map((item) => (
                                    <li key={item}>
                                        <a
                                            href={`#${item.toLowerCase()}`}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Company</h4>
                            <ul className="space-y-2.5">
                                {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} FlowHabit. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Made with <span className="text-red-400">♥</span> for habit builders
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
