"use server";

import { db } from "@/db";
import { habits, completions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { differenceInDays, parseISO, format } from "date-fns";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function getHabits(dateStr?: string) {
  try {
    const { userId } = await auth();
    // console.log("getHabits: User ID:", userId);

    if (!userId) {
      return [];
    }

    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(desc(habits.createdAt));

    // Get last 6 days dates
    const today = new Date();
    const dates: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(format(d, "yyyy-MM-dd"));
    }

    // Fetch completions for these habits in this date range
    // Efficient query: select * from completions where habitId in (ids) and date in (dates)
    // For now, simpler map loop might be fine for small data, or just fetch all for user.
    // Let's do a join or separate queries. Separate is easier to reason about for now.

    // We want to return { ...habit, completions: { "2025-01-01": true, "2025-01-02": false } }

    const habitsWithHistory = await Promise.all(allHabits.map(async (habit) => {
      const historyResults = await db
        .select({ date: completions.date, value: completions.value })
        .from(completions)
        .where(
          and(
            eq(completions.habitId, habit.id),
            eq(completions.completed, true)
          )
        );

      const completedDatesList = historyResults.map(h => h.date);
      const completedSet = new Set(completedDatesList);

      const recentHistory: Record<string, { completed: boolean, value: number | null }> = {};
      dates.forEach(date => {
        const found = historyResults.find(h => h.date === date);
        recentHistory[date] = {
          completed: !!found,
          value: found ? found.value : null
        };
      });

      // Calculate simple Score (last 30 days) for the list view
      let score = 0;
      let last30DaysCount = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      completedDatesList.forEach(d => {
        if (new Date(d) >= thirtyDaysAgo) last30DaysCount++;
      });
      score = Math.min(100, Math.round((last30DaysCount / 30) * 100));

      return {
        ...habit,
        color: habit.color || "#3b82f6",
        recentHistory, // map of date -> boolean
        score
      };
    }));

    return habitsWithHistory;
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    return [];
  }
}

export async function addHabit(name: string, color: string, description?: string, type: string = "boolean", goalValue?: number, unit?: string) {
  try {
    const authObj = await auth();
    const { userId } = authObj;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db.insert(habits).values({
      name,
      color,
      description,
      type,
      goalValue,
      unit,
      userId,
    }).returning();

    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to add habit:", error);
    return { success: false, error: String(error) };
  }
}

export async function toggleHabitCompletion(habitId: string, dateStr: string, isCompleted: boolean, value?: number) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (isCompleted) {
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
        value: value || null,
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

export async function deleteHabit(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Delete related completions first (if cascade is not set up, but schema says cascade)
    // Actually schema has cascade, so deleting habit is enough.
    await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete habit:", error);
    return { success: false, error };
  }
}

export async function updateHabit(id: string, name: string, color: string, description?: string, type?: string, goalValue?: number, unit?: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await db.update(habits)
      .set({
        name,
        color,
        description,
        type,
        goalValue,
        unit,
        updatedAt: new Date()
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update habit:", error);
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

    // Previous Month Score for Delta
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    let prevMonthCount = 0;

    dates.forEach(d => {
      const date = parseISO(d);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        currentMonthCount++;
      }
      if (date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear) {
        prevMonthCount++;
      }
    });
    const monthScore = Math.round((currentMonthCount / daysInMonth) * 100);
    const prevMonthScore = Math.round((prevMonthCount / daysInPrevMonth) * 100);
    const monthDelta = monthScore - prevMonthScore;

    // 3c. Year Score (Current Year)
    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = differenceInDays(today, startOfYear) + 1;
    let currentYearCount = 0;

    // Previous Year Score for Delta
    const prevYear = currentYear - 1;
    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const daysInPrevYear = isLeapYear(prevYear) ? 366 : 365;
    let prevYearCount = 0;

    dates.forEach(d => {
      const date = parseISO(d);
      if (date.getFullYear() === currentYear) {
        currentYearCount++;
      }
      if (date.getFullYear() === prevYear) {
        prevYearCount++;
      }
    });
    const yearScore = Math.round((currentYearCount / dayOfYear) * 100);
    const prevYearScore = Math.round((prevYearCount / daysInPrevYear) * 100);
    const yearDelta = yearScore - prevYearScore;

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
      const key = format(dateObj, "MMM");
      historyMap[key] = (historyMap[key] || 0) + 1;
    });

    const historyData = Object.entries(historyMap).map(([name, total]) => ({ name, total }));

    // 6. Rolling Score History (Approximation for Ogive Curve)
    // We want a daily series of the "Score" (last 30 days rolling average)
    // Let's generate data for the last 365 days or all time? 
    // The user wants filtering. Let's provide more data so client can filter.
    const rollingScoreHistory = [];
    const daysToGenerate = 365; // Cover a full year for the "Year" filter
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = format(d, "MMM dd");

      let windowCompletions = 0;
      const windowStart = new Date(d);
      windowStart.setDate(windowStart.getDate() - 29); // 30 day window

      dates.forEach(completionDateStr => {
        const completionDate = parseISO(completionDateStr);
        if (completionDate >= windowStart && completionDate <= d) {
          windowCompletions++;
        }
      });

      const dayScore = Math.min(100, Math.round((windowCompletions / 30) * 100));
      rollingScoreHistory.push({ name: dStr, score: dayScore, date: d });
    }


    // 7. Success Rate
    const earliestLog = dates.length > 0 ? parseISO(dates.sort((a, b) => a.localeCompare(b))[0]) : today;
    const daysActive = Math.max(1, differenceInDays(today, earliestLog) + 1);
    const successRate = Math.round((dates.length / daysActive) * 100);

    return {
      ...habit[0],
      logs: dates, // Already sorted ascending
      streak: currentStreak,
      totalCompletions: dates.length,
      completionRate: `${score}%`,

      // New Stats
      score,
      monthScore,
      monthDelta,
      yearScore,
      yearDelta,
      bestStreaks,
      frequencyStats: frequencyMap, // [Sun, Mon, ..., Sat] counts
      historyStats: historyData, // [{name: "Jan", total: 5}, ...]
      rollingScoreHistory, // [{name: "Jan 01", score: 80}, ...]
      successRate
    };
  } catch (error) {
    console.error("Error in getHabitDetails:", error);
    return null;
  }
}
