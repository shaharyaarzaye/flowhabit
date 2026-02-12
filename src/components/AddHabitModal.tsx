"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Hash, ToggleLeft, Sparkles } from "lucide-react";

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (habit: any) => void;
}

const COLORS = [
    { value: "#6366f1", name: "Indigo" },
    { value: "#3b82f6", name: "Blue" },
    { value: "#10b981", name: "Emerald" },
    { value: "#f59e0b", name: "Amber" },
    { value: "#ef4444", name: "Red" },
    { value: "#8b5cf6", name: "Violet" },
    { value: "#ec4899", name: "Pink" },
    { value: "#14b8a6", name: "Teal" },
];

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("boolean");
    const [goalValue, setGoalValue] = useState("1");
    const [unit, setUnit] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
            name,
            color: selectedColor,
            description,
            type,
            goalValue: type === "quantitative" ? parseInt(goalValue) : null,
            unit: type === "quantitative" ? unit : null,
        });
        setName("");
        setDescription("");
        setType("boolean");
        setGoalValue("1");
        setUnit("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal — bottom sheet on mobile, centered on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md z-50"
                    >
                        <div className="relative overflow-hidden rounded-t-3xl sm:rounded-3xl bg-card border border-border/80 shadow-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col">
                            {/* Drag handle — mobile */}
                            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-3 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-300"
                                        style={{ backgroundColor: selectedColor + "20" }}
                                    >
                                        <Sparkles className="w-4 h-4 transition-colors duration-300" style={{ color: selectedColor }} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">New Habit</h2>
                                        <p className="text-[10px] text-muted-foreground">Build something great</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto flex-1 no-scrollbar">
                                <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
                                    {/* Habit Name */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Habit Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Morning Yoga"
                                            className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border/50 focus:border-indigo-500/50 focus:bg-card focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm placeholder:text-muted-foreground/50"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Description
                                            <span className="font-normal normal-case tracking-normal ml-1 opacity-60">optional</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Why is this habit important to you?"
                                            className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border/50 focus:border-indigo-500/50 focus:bg-card focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm resize-none h-16 placeholder:text-muted-foreground/50"
                                        />
                                    </div>

                                    {/* Habit Type — card-style toggle */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                            Tracking Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setType("boolean")}
                                                className={`relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border transition-all duration-200 ${type === "boolean"
                                                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-sm"
                                                        : "bg-muted/40 border-border/50 hover:border-border"
                                                    }`}
                                            >
                                                {type === "boolean" && (
                                                    <motion.div
                                                        layoutId="typeIndicator"
                                                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"
                                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                                <ToggleLeft className={`w-5 h-5 ${type === "boolean" ? "text-indigo-500" : "text-muted-foreground"}`} />
                                                <span className={`text-xs font-bold ${type === "boolean" ? "text-foreground" : "text-muted-foreground"}`}>
                                                    Yes / No
                                                </span>
                                                <span className="text-[9px] text-muted-foreground leading-tight">
                                                    Simple check-off
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setType("quantitative")}
                                                className={`relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border transition-all duration-200 ${type === "quantitative"
                                                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-sm"
                                                        : "bg-muted/40 border-border/50 hover:border-border"
                                                    }`}
                                            >
                                                {type === "quantitative" && (
                                                    <motion.div
                                                        layoutId="typeIndicator"
                                                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"
                                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                                <Hash className={`w-5 h-5 ${type === "quantitative" ? "text-indigo-500" : "text-muted-foreground"}`} />
                                                <span className={`text-xs font-bold ${type === "quantitative" ? "text-foreground" : "text-muted-foreground"}`}>
                                                    Numeric
                                                </span>
                                                <span className="text-[9px] text-muted-foreground leading-tight">
                                                    Track a value
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quantitative fields */}
                                    <AnimatePresence>
                                        {type === "quantitative" && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                                            Daily Goal
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={goalValue}
                                                            onChange={(e) => setGoalValue(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border/50 focus:border-indigo-500/50 focus:bg-card focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                                            Unit
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={unit}
                                                            onChange={(e) => setUnit(e.target.value)}
                                                            placeholder="km, mins, glass"
                                                            className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border/50 focus:border-indigo-500/50 focus:bg-card focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm placeholder:text-muted-foreground/50"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Color picker */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                            Color
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color.value)}
                                                    className="relative group"
                                                >
                                                    <div
                                                        className={`w-8 h-8 rounded-full transition-all duration-200 ${selectedColor === color.value
                                                                ? "scale-110 shadow-lg"
                                                                : "hover:scale-105"
                                                            }`}
                                                        style={{
                                                            backgroundColor: color.value,
                                                            boxShadow: selectedColor === color.value ? `0 4px 12px ${color.value}40` : undefined,
                                                        }}
                                                    />
                                                    {selectedColor === color.value && (
                                                        <motion.div
                                                            layoutId="colorCheck"
                                                            className="absolute inset-0 flex items-center justify-center"
                                                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                                        >
                                                            <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={!name.trim()}
                                        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:brightness-100 flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Create Habit
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
