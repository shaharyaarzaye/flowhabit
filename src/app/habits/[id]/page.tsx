"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar, BarChart2, Hash, Settings } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import HabitCalendar from "@/components/HabitCalendar";

const MOCK_HABIT = {
    id: "1",
    name: "Read 10 pages",
    color: "#6366f1",
    description: "Improve focus and knowledge by reading every day.",
    streak: 5,
    totalCompletions: 42,
    completionRate: "85%",
    logs: [new Date(), new Date(Date.now() - 86400000)],
};

export default function HabitDetailsPage() {
    const params = useParams();
    const router = useRouter();

    return (
        <main className="min-h-screen max-w-2xl mx-auto py-8 px-4">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to habits</span>
            </button>

            <div className="flex items-center gap-6 mb-12">
                <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                    style={{ backgroundColor: MOCK_HABIT.color }}
                >
                    {MOCK_HABIT.name[0]}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-foreground font-display">{MOCK_HABIT.name}</h1>
                    <p className="text-muted-foreground mt-1">{MOCK_HABIT.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
                <StatCard label="Current Streak" value={`${MOCK_HABIT.streak} days`} icon={<Hash className="w-5 h-5" />} color="#f59e0b" />
                <StatCard label="Total Loops" value={MOCK_HABIT.totalCompletions} icon={<BarChart2 className="w-5 h-5" />} color="#6366f1" />
            </div>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>History</span>
                    </h2>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <HabitCalendar completedDates={MOCK_HABIT.logs} />
            </section>
        </main>
    );
}
