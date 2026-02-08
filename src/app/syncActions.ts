"use server";

import { db } from "@/db";
import { habits, completions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncLocalHabits(localHabits: any[]) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        if (!localHabits || localHabits.length === 0) return { success: true };

        for (const habit of localHabits) {
            // Simple insert, assuming no complex conflict resolution needed for first sync
            console.log("Syncing habit:", habit.name);
            await db.insert(habits).values({
                name: habit.name,
                color: habit.color,
                userId,
            });
            // Note: We are not syncing past completions for now to keep it simple, 
            // as local storage structure for completions might differ or be non-existent in this simple implementation.
            // If completions are in local storage, we would need to sync them too.
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to sync habits:", error);
        return { success: false, error };
    }
}
