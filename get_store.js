require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT * FROM "Store"
      WHERE id = 'cmrnf5u13000104jjqxnod2ur';
    `);
    console.log("Store data:", res.rows[0]);
    
    if (res.rows[0]) {
      const ownerRes = await pool.query(`
        SELECT * FROM "User"
        WHERE id = $1;
      `, [res.rows[0].ownerId]);
      console.log("Owner data:", ownerRes.rows[0]);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
