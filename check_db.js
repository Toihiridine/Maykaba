require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Store';
    `);
    console.log("Store table columns:", res.rows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
