import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employee.routes.js';
import clearanceRoutes from './routes/clearance.routes.js';
import { testConnection } from './db/connection.js';
const app = express();
const PORT = process.env.PORT || 5000;
// ✅ CORS Configuration - Allow frontend to connect
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/employees', employeeRoutes);
app.use('/api/clearance', clearanceRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Employee Masterdata API is running' });
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Test database connection on startup
testConnection().then((success) => {
    if (success) {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`✅ CORS enabled for http://localhost:3000`);
            console.log(`📄 Clearance route enabled at /api/clearance/:employeeId`);
        });
    }
    else {
        console.error('❌ Failed to connect to database. Server not started.');
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map