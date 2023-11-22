const { Pool } = require('pg');
const connectDatabase = async () => {
    const dbConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
      //   ssl: { rejectUnauthorized: false } // Use this line if connecting to a Heroku PostgreSQL database with SSL
      };
      console.log("dbConfig => ", dbConfig)
      const pool = new Pool(dbConfig);
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Database connected');
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err.message);
  }
};

module.exports = connectDatabase;
