require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];');
    console.log('Added permissions to User');
  } catch (e) { console.log(e.message); }

  console.log("Done");
  process.exit(0);
}
main();
