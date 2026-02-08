"use server";

import { db } from "@/db";
import { habits, completions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { differenceInDays, parseISO, format } from "date-fns";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function getHabits(dateStr: string) {
  try {
    const { userId } = await auth();
    console.log("getHabits: User ID:", userId, "Date:", dateStr);

    if (!userId) {
      console.log("getHabits: No user ID, returning empty.");
      return [];
    }

    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId));

    console.log("getHabits: Found habits count:", allHabits.length);

    const completedHabitIds = new Set();

    if (allHabits.length > 0) {
      const results = await db
        .select({ habitId: completions.habitId })
        .from(completions)
        .where(
          and(
            eq(completions.date, dateStr),
            eq(completions.completed, true)
          )
        );
      results.forEach((r) => completedHabitIds.add(r.habitId));
    }

    return allHabits.map((habit) => ({
      ...habit,
      isCompleted: completedHabitIds.has(habit.id),
      // Ensure color has a default fallback
      color: habit.color || "#3b82f6",
      icon: habit.icon || "Circle"
    }));
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    return [];
  }
}

export async function addHabit(name: string, color: string) {
  try {
    const authObj = await auth();
    console.log("AddHabit Auth Object:", JSON.stringify(authObj, null, 2));
    const userId = authObj.userId;
    console.log("Adding habit for user:", userId);

    if (!userId) {
      console.error("AddHabit: User not authenticated");
      return { success: false, error: "Unauthorized: No User ID found in session" };
    }

    const result = await db.insert(habits).values({
      name,
      color,
      userId,
    }).returning();

    console.log("Habit added successfully:", result);
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to add habit:", error);
    return { success: false, error: String(error) };
  }
}

export async function toggleHabitCompletion(habitId: string, dateStr: string, isCompleted: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (isCompleted) {
      // First delete any existing completion to avoid duplicates if no unique constraint exists
      await db
        .delete(completions)
        .where(
          and(
            eq(completions.habitId, habitId),
            eq(completions.date, dateStr)
          )
        );

      await db.insert(completions).values({
        habitId,
        date: dateStr,
        completed: true,
      });
    } else {
      await db
        .delete(completions)
        .where(
          and(
            eq(completions.habitId, habitId),
            eq(completions.date, dateStr)
          )
        );
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle habit:", error);
    return { success: false, error };
  }
}

export async function getHabitDetails(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const habit = await db.select().from(habits).where(eq(habits.id, id)).limit(1);

    if (!habit.length) return null;

    const completionsData = await db
      .select()
      .from(completions)
      .where(eq(completions.habitId, id))
      .orderBy(desc(completions.date));

    // Sort dates ascending for calculation
    const dates = completionsData.map((c) => c.date).sort();
    const completedSet = new Set(dates);

    // --- Calculations ---

    // 1. Current Streak
    let currentStreak = 0;
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    if (completedSet.has(todayStr)) {
      currentStreak = 1;
      let d = new Date(today);
      d.setDate(d.getDate() - 1);
      while (completedSet.has(format(d, "yyyy-MM-dd"))) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    } else if (completedSet.has(yesterdayStr)) {
      currentStreak = 1;
      let d = new Date(yesterday);
      d.setDate(d.getDate() - 1);
      while (completedSet.has(format(d, "yyyy-MM-dd"))) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    }

    // 2. All Streaks (for "Best streaks" list)
    const streaks = [];
    if (dates.length > 0) {
      let start = dates[0];
      let end = dates[0];
      let length = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = parseISO(dates[i - 1]);
        const currDate = parseISO(dates[i]);
        const diff = differenceInDays(currDate, prevDate);

        if (diff === 1) {
          length++;
          end = dates[i];
        } else {
          streaks.push({ start, end, length });
          start = dates[i];
          end = dates[i];
          length = 1;
        }
      }
      streaks.push({ start, end, length });
    }
    // Sort streaks by length descending
    const bestStreaks = streaks.sort((a, b) => b.length - a.length).slice(0, 5);


    // 3. Score (last 30 days consistency)
    // Simple calc: completions in last 30 days / 30 * 100
    // Ideal world: compare vs frequency setting. Assuming daily for now.
    let score = 0;
    let last30DaysCount = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dates.forEach(d => {
      if (new Date(d) >= thirtyDaysAgo) last30DaysCount++;
    });
    score = Math.min(100, Math.round((last30DaysCount / 30) * 100));

    // 3b. Month Score (Current Month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let currentMonthCount = 0;

    dates.forEach(d => {
      const date = parseISO(d);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        currentMonthCount++;
      }
    });
    const monthScore = Math.round((currentMonthCount / daysInMonth) * 100);

    // 3c. Year Score (Current Year)
    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = differenceInDays(today, startOfYear) + 1;
    let currentYearCount = 0;

    dates.forEach(d => {
      const date = parseISO(d);
      if (date.getFullYear() === currentYear) {
        currentYearCount++;
      }
    });
    const yearScore = Math.round((currentYearCount / dayOfYear) * 100);

    // 4. Frequency (Day of week distribution)
    const frequencyMap = new Array(7).fill(0); // 0=Sun, 6=Sat
    dates.forEach(d => {
      const day = parseISO(d).getDay();
      frequencyMap[day]++;
    });

    // 5. Monthly History (for Bar Chart)
    // Map: "Jan 2025" -> count
    const historyMap: Record<string, number> = {};
    dates.forEach(d => {
      const dateObj = parseISO(d);
      const key = format(dateObj, "MMM yyyy");
      historyMap[key] = (historyMap[key] || 0) + 1;
    });

    const historyData = Object.entries(historyMap).map(([name, total]) => ({ name, total }));


    return {
      ...habit[0],
      logs: dates, // Already sorted ascending
      streak: currentStreak,
      totalCompletions: dates.length,
      completionRate: `${score}%`,

      // New Stats
      score,
      monthScore,
      yearScore,
      bestStreaks,
      frequencyStats: frequencyMap, // [Sun, Mon, ..., Sat] counts
      historyStats: historyData // [{name: "Jan 2025", total: 5}, ...]
    };
  } catch (error) {
    console.error("Failed to get habit details:", error);
    return null;
  }
}
