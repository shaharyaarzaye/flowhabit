import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const habits = pgTable("habits", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").default("Circle"),
    color: text("color").default("#3b82f6"), // blue-500
    type: text("type").default("boolean").notNull(), // 'boolean' or 'quantitative'
    goalValue: integer("goal_value"),
    unit: text("unit"),
    frequency: jsonb("frequency").default({ type: "daily", days: [] }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    razorpayOrderId: text("razorpay_order_id").notNull(),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpaySignature: text("razorpay_signature"),
    amount: integer("amount").notNull(), // in paise
    currency: text("currency").default("INR").notNull(),
    status: text("status").default("created").notNull(), // 'created', 'paid', 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const completions = pgTable("completions", {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id").references(() => habits.id, { onDelete: "cascade" }).notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    completed: boolean("completed").default(true).notNull(),
    value: integer("value"), // Numeric value for quantitative habits
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
