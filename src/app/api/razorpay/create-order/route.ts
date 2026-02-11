import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { purchases } from "@/db/schema";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const UPGRADE_AMOUNT = 4900; // ₹49 in paise — adjust as needed

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const order = await razorpay.orders.create({
            amount: UPGRADE_AMOUNT,
            currency: "INR",
            receipt: `flowhabit_pro_${userId}_${Date.now()}`,
            notes: {
                userId,
                purpose: "FlowHabit Pro Upgrade",
            },
        });

        // Save order record in DB
        await db.insert(purchases).values({
            userId,
            razorpayOrderId: order.id,
            amount: UPGRADE_AMOUNT,
            currency: "INR",
            status: "created",
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
