import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = await req.json();

        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json(
                { error: "Payment verification failed" },
                { status: 400 }
            );
        }

        // Update the purchase record
        await db
            .update(purchases)
            .set({
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "paid",
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(purchases.razorpayOrderId, razorpay_order_id),
                    eq(purchases.userId, userId)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully! You are now a Pro user.",
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        );
    }
}
