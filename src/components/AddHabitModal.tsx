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
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
            name,
            color: selectedColor,
        });
        setName("");
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card p-6 rounded-2xl shadow-xl z-50 border border-border"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add New Habit</h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Habit Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Morning Yoga"
                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-transparent focus:border-accent focus:bg-card transition-all outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-3">Color Label</label>
                                <div className="flex gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-2 ring-accent scale-110" : ""
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
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
