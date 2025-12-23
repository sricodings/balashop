const express = require('express');
const router = express.Router();
const db = require('../db');

// Record a sale
router.post('/', async (req, res) => {
    const { product_id, quantity, sale_price } = req.body;

    // Validate inputs
    if (!product_id || !quantity || !sale_price) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [products] = await db.query('SELECT price_cost, stock_quantity FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

        const product = products[0];
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const total_amount = sale_price * quantity;
        const profit = (sale_price - product.price_cost) * quantity;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [quantity, product_id]);

            await connection.query(
                'INSERT INTO sales (product_id, quantity, sale_price, total_amount, profit) VALUES (?, ?, ?, ?, ?)',
                [product_id, quantity, sale_price, total_amount, profit]
            );

            await connection.commit();
            res.status(201).json({ message: 'Sale recorded successfully', profit });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get sales history
router.get('/', async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT s.*, p.name as product_name, p.type, p.image_url 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            ORDER BY s.sale_date DESC
        `);
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
