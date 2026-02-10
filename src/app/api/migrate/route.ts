import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Adding columns to habits
        await db.execute(sql`ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'boolean' NOT NULL`);
        await db.execute(sql`ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "goal_value" integer`);
        await db.execute(sql`ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "unit" text`);

        // Adding column to completions
        await db.execute(sql`ALTER TABLE "completions" ADD COLUMN IF NOT EXISTS "value" integer`);

        return NextResponse.json({ success: true, message: "Migration successful" });
    } catch (error) {
        console.error("Migration failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
