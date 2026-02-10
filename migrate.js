const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        console.log("Starting migration...");
        await sql(`ALTER TABLE habits ADD COLUMN IF NOT EXISTS type text DEFAULT 'boolean' NOT NULL`);
        await sql(`ALTER TABLE habits ADD COLUMN IF NOT EXISTS goal_value integer`);
        await sql(`ALTER TABLE habits ADD COLUMN IF NOT EXISTS unit text`);
        await sql(`ALTER TABLE completions ADD COLUMN IF NOT EXISTS value integer`);
        console.log("Migration finished successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

run();
