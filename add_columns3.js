require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`
      CREATE TABLE "GlobalSetting" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "GlobalSetting_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Created GlobalSetting table');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`CREATE UNIQUE INDEX "GlobalSetting_key_key" ON "GlobalSetting"("key");`);
    console.log('Created index on GlobalSetting');
  } catch (e) { console.log(e.message); }

  console.log("Done");
  process.exit(0);
}
main();
