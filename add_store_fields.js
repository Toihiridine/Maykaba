require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'SUSPENDED');`);
    console.log('Created StoreStatus enum');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`ALTER TABLE "Store" ADD COLUMN "phone" TEXT;`);
    console.log('Added phone to Store');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`ALTER TABLE "Store" ADD COLUMN "status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE';`);
    console.log('Added status to Store');
  } catch (e) { console.log(e.message); }

  console.log("Done");
  process.exit(0);
}
main();
