const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Route imports
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const { sendReport } = require('./services/reportService');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.send('Striker Shop API is running');
});

// Scheduler
// Daily at 11:00 PM (23:00)
cron.schedule('0 23 * * *', () => {
    console.log('Running daily sales report job...');
    sendReport('daily');
});

// Monthly at 7:00 AM on day 1
cron.schedule('0 7 1 * *', () => {
    console.log('Running monthly stock report job...');
    sendReport('monthly');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
