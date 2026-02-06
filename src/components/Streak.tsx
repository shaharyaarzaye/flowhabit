"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakProps {
    count: number;
}

export default function Streak({ count }: StreakProps) {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-lg"
        >
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{count} day streak</span>
        </motion.div>
    );
}
