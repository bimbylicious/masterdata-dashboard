import { Pool } from 'pg';
export const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'masterdata',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});
// Export a function to test the connection
export async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        client.release();
        return true;
    }
    catch (err) {
        console.error('Database connection error:', err);
        return false;
    }
}
//# sourceMappingURL=connection.js.map