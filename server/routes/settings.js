const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendReport, generateStockReportPDF } = require('../services/reportService');

// Get settings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => settings[r.key_name] = r.value);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update settings
router.post('/update', async (req, res) => {
    const settings = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await db.query('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, value, value]);
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger Manual Email Report
router.post('/send-test', async (req, res) => {
    const { type } = req.body; // 'daily' or 'monthly'
    try {
        await sendReport(type || 'daily');
        res.json({ message: 'Report email triggered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download Stock PDF
router.get('/download-stock-pdf', async (req, res) => {
    try {
        const pdfBuffer = await generateStockReportPDF();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=stock-report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
