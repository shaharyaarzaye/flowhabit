"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Edit2, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface HabitCardProps {
    id: string;
    name: string;
    icon: string;
    color: string;
    isCompleted: boolean;
    onToggle: (id: string) => void;
}

export default function HabitCard({ id, name, icon: IconName, color, isCompleted, onToggle }: HabitCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                >
                    {/* We'll handle dynamic icons later, for now we show initial or generic */}
                    <span className="text-xl font-bold">{name[0].toUpperCase()}</span>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">{name}</h3>
                    <p className="text-xs text-muted-foreground italic">Daily</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isHovered && (
                    <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button className="p-2 hover:bg-muted rounded-full transition-colors">
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                )}

                <button
                    onClick={() => onToggle(id)}
                    className={cn(
                        "habit-circle w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isCompleted
                            ? "bg-accent border-accent text-accent-foreground"
                            : "border-border hover:border-accent group-hover:bg-accent/5"
                    )}
                    style={isCompleted ? { backgroundColor: color, borderColor: color } : {}}
                >
                    {isCompleted && <Check className="w-6 h-6 animate-in zoom-in duration-300" />}
                </button>
            </div>
        </motion.div>
    );
}
