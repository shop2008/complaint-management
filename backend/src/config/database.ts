import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Function to decode base64 CA cert and create temp file in memory
// function getSSLConfig() {
//   try {
//     const caCert = Buffer.from(
//       process.env.MYSQL_CA_CERT ?? "",
//       "base64"
//     ).toString("utf-8");

//     return {
//       ca: caCert,
//       rejectUnauthorized: true,
//     };
//   } catch (error) {
//     console.error("Error processing CA certificate:", error);
//     throw error;
//   }
// }

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "customer_complaints",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ssl: getSSLConfig(),
});

export default pool;
