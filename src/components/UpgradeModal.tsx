"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Infinity as InfinityIcon, TrendingUp, BarChart3, Shield, Sparkles } from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgradeSuccess: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const FEATURES = [
    { icon: InfinityIcon, label: "Unlimited Habits", description: "Track as many habits as you want" },
    { icon: TrendingUp, label: "Advanced Analytics", description: "Deep insights into your progress" },
    { icon: BarChart3, label: "Detailed Reports", description: "Monthly & yearly performance stats" },
    { icon: Shield, label: "Priority Support", description: "Get help when you need it" },
];

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: UpgradeModalProps) {
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
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert("Failed to load payment gateway. Please try again.");
                setIsProcessing(false);
                return;
            }

            // Create order
            const res = await fetch("/api/razorpay/create-order", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to create order");
            }

            const orderData = await res.json();

            // Open Razorpay checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "FlowHabit",
                description: "FlowHabit Pro — Lifetime Access",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Verify payment on server
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl">
                            {/* Gradient Background Decoration */}
                            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {/* Content */}
                            <div className="relative p-6 pt-8">
                                {/* Badge */}
                                <div className="flex justify-center mb-4">
                                    <motion.div
                                        animate={{ rotate: [0, -5, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                                    >
                                        <Zap className="w-8 h-8 text-white" fill="white" />
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                                        Upgrade to
                                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                            Pro
                                        </span>
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        You&apos;ve reached the free limit of <strong>4 habits</strong>. Unlock unlimited tracking!
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-6">
                                    {FEATURES.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center shrink-0"
                                            >
                                                <feature.icon className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground">{feature.label}</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Price */}
                                <div className="text-center mb-4">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                            ₹49
                                        </span>
                                        <span className="text-muted-foreground text-xs font-medium">one-time</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        Lifetime access • No subscriptions
                                    </p>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={handleUpgrade}
                                    disabled={isProcessing}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                            <Zap className="w-4 h-4" />
                                            Upgrade Now
                                        </>
                                    )}
                                </button>

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
