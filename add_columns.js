require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN "stripeAccountId" TEXT;');
    console.log('Added stripeAccountId to User');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE "Store" ADD COLUMN "stripeAccountId" TEXT;');
    console.log('Added stripeAccountId to Store');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE "Store" ADD COLUMN "slug" TEXT;');
    // We can't add a unique index immediately if there are existing rows with null slugs, but since it's dev, it might be empty.
    console.log('Added slug to Store');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE "Order" ADD COLUMN "pinCode" TEXT;');
    console.log('Added pinCode to Order');
  } catch (e) { console.log(e.message); }
  
  try {
    await pool.query('ALTER TABLE "Order" ADD COLUMN "storeValidatedPickup" BOOLEAN NOT NULL DEFAULT false;');
    console.log('Added storeValidatedPickup to Order');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE "Order" ADD COLUMN "courierValidatedPickup" BOOLEAN NOT NULL DEFAULT false;');
    console.log('Added courierValidatedPickup to Order');
  } catch (e) { console.log(e.message); }
  
  try {
    await pool.query('ALTER TABLE "Order" ADD COLUMN "stripePaymentId" TEXT;');
    console.log('Added stripePaymentId to Order');
  } catch (e) { console.log(e.message); }
  
  try {
    await pool.query('ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;');
    console.log('Added orderNumber to Order');
  } catch (e) { console.log(e.message); }

  console.log("Done");
  process.exit(0);
}
main();
