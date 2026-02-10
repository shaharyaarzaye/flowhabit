"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (habit: any) => void;
}

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("boolean");
    const [goalValue, setGoalValue] = useState("1");
    const [unit, setUnit] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card p-6 rounded-2xl shadow-xl z-50 border border-border max-h-[90vh] overflow-y-auto no-scrollbar"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Add New Habit</h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Habit Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Morning Yoga"
                                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-accent focus:bg-card transition-all outline-none text-sm"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Why are you doing this?"
                                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-accent focus:bg-card transition-all outline-none text-sm resize-none h-20"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Habit Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setType("boolean")}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${type === "boolean" ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                    >
                                        Yes/No
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("quantitative")}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${type === "quantitative" ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                    >
                                        Numeric
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {type === "quantitative" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="grid grid-cols-2 gap-3 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Daily Goal</label>
                                            <input
                                                type="number"
                                                value={goalValue}
                                                onChange={(e) => setGoalValue(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-accent focus:bg-card transition-all outline-none text-sm"
                                                min="1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Unit</label>
                                            <input
                                                type="text"
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                placeholder="e.g. km, mins, glass"
                                                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-accent focus:bg-card transition-all outline-none text-sm"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Color Label</label>
                                <div className="flex gap-2.5 flex-wrap">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-7 h-7 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-2 ring-accent scale-110" : ""
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-accent text-accent-foreground rounded-xl font-bold hover:opacity-90 transition-opacity mt-2 text-sm"
                            >
                                Create Habit
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
