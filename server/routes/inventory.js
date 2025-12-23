const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products ORDER BY id DESC');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search products (MUST BE BEFORE /:id)
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: 'Query required' });

    try {
        const searchTerm = `%${query}%`;
        const [products] = await db.query(
            'SELECT * FROM products WHERE name LIKE ? OR type LIKE ? OR color LIKE ? OR id = ?',
            [searchTerm, searchTerm, searchTerm, query]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add product
router.post('/', upload.array('images', 5), async (req, res) => {
    const { name, type, gender, size, color, price_cost, price_sell, stock_quantity, location_in_shop, description } = req.body;

    // Determine main image URL
    let main_image_url = req.body.image_url || null;
    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
        // Use first uploaded file as main if not provided manually
        if (!main_image_url) {
            main_image_url = `/uploads/${req.files[0].filename}`;
        }
        uploadedFiles = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
        // Fallback if single used somehow
        if (!main_image_url) main_image_url = `/uploads/${req.file.filename}`;
        uploadedFiles = [`/uploads/${req.file.filename}`];
    }

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.query(
                'INSERT INTO products (name, type, gender, size, color, price_cost, price_sell, stock_quantity, image_url, location_in_shop, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, type, gender, size, color, price_cost, price_sell, stock_quantity, main_image_url, location_in_shop, description]
            );

            const productId = result.insertId;

            // Insert into product_images
            if (uploadedFiles.length > 0) {
                const imageValues = uploadedFiles.map(url => [productId, url]);
                await connection.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [imageValues]);
            }

            await connection.commit();
            res.status(201).json({ id: productId, message: 'Product added successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        // Cascade delete should handle images, but explicit safety is good. 
        // Our schema has ON DELETE CASCADE so it's fine.
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product
router.put('/:id', upload.array('images', 5), async (req, res) => {
    const { name, type, gender, size, color, price_cost, price_sell, stock_quantity, location_in_shop, description } = req.body;

    let main_image_url = req.body.image_url;
    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
        uploadedFiles = req.files.map(f => `/uploads/${f.filename}`);
        if (!main_image_url) {
            main_image_url = uploadedFiles[0];
        }
    }

    let params = [name, type, gender, size, color, price_cost, price_sell, stock_quantity, location_in_shop, description];
    let imageClause = '';

    // Only update main image if we have a new one or explicitly cleared (not handling clear in this simple logic)
    if (main_image_url) {
        imageClause = ', image_url = ?';
        params.push(main_image_url);
    }

    params.push(req.params.id);

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `UPDATE products SET name=?, type=?, gender=?, size=?, color=?, price_cost=?, price_sell=?, stock_quantity=?, location_in_shop=?, description=? ${imageClause} WHERE id=?`,
                params
            );

            if (uploadedFiles.length > 0) {
                const imageValues = uploadedFiles.map(url => [req.params.id, url]);
                await connection.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [imageValues]);
            }

            await connection.commit();
            res.json({ message: 'Product updated' });
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

module.exports = router;
