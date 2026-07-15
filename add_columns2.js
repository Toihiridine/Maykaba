require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`CREATE TYPE "CourierStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');`);
    console.log('Created CourierStatus enum');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`
      CREATE TABLE "CourierProfile" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "idCardUrl" TEXT NOT NULL,
          "selfieUrl" TEXT NOT NULL,
          "status" "CourierStatus" NOT NULL DEFAULT 'PENDING',
          "rejectionReason" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "CourierProfile_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Created CourierProfile table');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`CREATE UNIQUE INDEX "CourierProfile_userId_key" ON "CourierProfile"("userId");`);
    console.log('Created index on CourierProfile');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query(`ALTER TABLE "CourierProfile" ADD CONSTRAINT "CourierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
    console.log('Added foreign key constraint to CourierProfile');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE "Store" ADD COLUMN "logoUrl" TEXT;');
    console.log('Added logoUrl to Store');
  } catch (e) { console.log(e.message); }

  console.log("Done");
  process.exit(0);
}
main();
