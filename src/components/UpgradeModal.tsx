"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Infinity as InfinityIcon, TrendingUp, BarChart3, Shield, Sparkles, Check } from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgradeSuccess: () => void;
    hitLimit?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const FEATURES = [
    { icon: InfinityIcon, label: "Unlimited Habits" },
    { icon: TrendingUp, label: "Advanced Analytics" },
    { icon: BarChart3, label: "Detailed Reports" },
    { icon: Shield, label: "Priority Support" },
];

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess, hitLimit = false }: UpgradeModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        setIsProcessing(true);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert("Failed to load payment gateway. Please try again.");
                setIsProcessing(false);
                return;
            }

            const res = await fetch("/api/razorpay/create-order", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to create order");
            }

            const orderData = await res.json();

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "FlowHabit",
                description: "FlowHabit Pro — Lifetime Access",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            onUpgradeSuccess();
                            onClose();
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {},
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                console.error("Payment failed:", response.error);
                alert(`Payment failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Something went wrong. Please try again.");
            setIsProcessing(false);
        }
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal — bottom sheet on mobile, centered on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-[380px] z-50"
                    >
                        <div className="relative overflow-hidden rounded-t-3xl sm:rounded-3xl bg-card border border-border/80 shadow-2xl">
                            {/* Decorative gradients */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/8 via-purple-500/4 to-transparent pointer-events-none" />
                            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                            {/* Drag handle — mobile only */}
                            <div className="sm:hidden flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 hover:bg-muted rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {/* Content */}
                            <div className="relative px-5 pb-6 pt-4 sm:p-6 sm:pt-7">
                                {/* Glowing badge */}
                                <div className="flex justify-center mb-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-lg opacity-40" />
                                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <Zap className="w-7 h-7 text-white" fill="white" />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-4">
                                    <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
                                        Upgrade to
                                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                            Pro
                                        </span>
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                    </h2>
                                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                        {hitLimit
                                            ? <>You&apos;ve reached the free limit of <strong>4 habits</strong>. Upgrade to unlock unlimited tracking!</>
                                            : "Go Pro and unlock unlimited habits, analytics, and more."
                                        }
                                    </p>
                                </div>

                                {/* Features — compact 2x2 grid */}
                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    {FEATURES.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * i + 0.1 }}
                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/40"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center shrink-0">
                                                <feature.icon className="w-3.5 h-3.5 text-indigo-500" />
                                            </div>
                                            <p className="text-[11px] font-semibold text-foreground leading-tight">{feature.label}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Price section */}
                                <div className="text-center mb-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500/[0.06] to-purple-500/[0.06] border border-indigo-500/10">
                                    <div className="flex items-baseline justify-center gap-1.5">
                                        <span className="text-sm text-muted-foreground line-through">₹199</span>
                                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                            ₹99
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                        One-time payment • Lifetime access
                                    </p>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={handleUpgrade}
                                    disabled={isProcessing}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" fill="currentColor" />
                                            Upgrade Now — ₹99
                                        </>
                                    )}
                                </button>

                                {/* Trust badge */}
                                <p className="text-center text-[10px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Secured by Razorpay • 100% Safe
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
