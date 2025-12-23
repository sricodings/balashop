const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        const [stockCount] = await db.query('SELECT SUM(stock_quantity) as total_stock FROM products');
        const [salesStats] = await db.query('SELECT SUM(total_amount) as total_revenue, SUM(profit) as total_profit FROM sales');
        const [lowStock] = await db.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity < 5');

        // Get recent sales for chart
        const [recentSales] = await db.query(`
            SELECT DATE(sale_date) as date, SUM(total_amount) as revenue 
            FROM sales 
            GROUP BY DATE(sale_date) 
            ORDER BY date DESC LIMIT 7
        `); // Last 7 days

        // Category distribution for pie chart
        const [categoryDist] = await db.query(`
            SELECT type, COUNT(*) as count FROM products GROUP BY type
        `);

        res.json({
            total_stock: stockCount[0].total_stock || 0,
            total_revenue: salesStats[0].total_revenue || 0,
            total_profit: salesStats[0].total_profit || 0,
            low_stock_alerts: lowStock[0].count || 0,
            recent_sales: recentSales.reverse(),
            category_distribution: categoryDist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
