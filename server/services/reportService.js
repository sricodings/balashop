const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const db = require('../db');
const fs = require('fs');
const path = require('path');

// Helper to get settings
const getSettings = async () => {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => settings[r.key_name] = r.value);
    return settings;
};

// Create Transporter
const createTransporter = async (settings) => {
    return nodemailer.createTransport({
        service: settings.email_service || 'gmail',
        auth: {
            user: settings.email_user,
            pass: settings.email_pass
        }
    });
};

// Generate Daily Sales PDF
const generateDailyReportPDF = async (date) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise(async (resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Fetch Data
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        try {
            const [sales] = await db.query(
                `SELECT s.*, p.name as product_name 
                 FROM sales s 
                 LEFT JOIN products p ON s.product_id = p.id 
                 WHERE s.sale_date BETWEEN ? AND ?`,
                [startOfDay, endOfDay]
            );

            // Report Header
            doc.fontSize(20).text(`Daily Sales Report - ${date.toDateString()}`, { align: 'center' });
            doc.moveDown();

            // Summary
            const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
            const totalProfit = sales.reduce((sum, s) => sum + Number(s.profit), 0);

            doc.fontSize(12).text(`Total Sales: ${sales.length}`);
            doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`);
            doc.text(`Total Profit: Rs. ${totalProfit.toFixed(2)}`);
            doc.moveDown();

            // Table Header
            const tableTop = 200;
            let y = tableTop;

            doc.font('Helvetica-Bold');
            doc.text('Time', 50, y);
            doc.text('Product', 150, y);
            doc.text('Qty', 350, y);
            doc.text('Amount', 400, y);
            doc.font('Helvetica');
            y += 20;

            // Rows
            sales.forEach(sale => {
                const time = new Date(sale.sale_date).toLocaleTimeString();

                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }

                doc.text(time, 50, y);
                doc.text(sale.product_name || 'Unknown', 150, y, { width: 190 });
                doc.text(sale.quantity.toString(), 350, y);
                doc.text(`Rs. ${Number(sale.total_amount).toFixed(2)}`, 400, y);
                y += 20;
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

// Generate Monthly Stock PDF
const generateStockReportPDF = async () => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise(async (resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        try {
            const [products] = await db.query('SELECT * FROM products ORDER BY stock_quantity ASC');

            doc.fontSize(20).text(`Monthly Stock Report - ${new Date().toDateString()}`, { align: 'center' });
            doc.moveDown();

            // Low Stock Section
            const lowStock = products.filter(p => p.stock_quantity < 5);
            if (lowStock.length > 0) {
                doc.fillColor('red').fontSize(14).text('LOW STOCK ALERTS', { underline: true });
                doc.fontSize(10).fillColor('black');
                lowStock.forEach(p => {
                    doc.text(`[${p.stock_quantity}] ${p.name} - ${p.location_in_shop || 'No Loc'}`);
                });
                doc.moveDown();
            }

            // Full Stock Table
            doc.fontSize(14).text('Full Inventory Status', { underline: true });
            doc.moveDown();

            const tableTop = doc.y;
            let y = tableTop;

            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('ID', 50, y);
            doc.text('Name', 80, y);
            doc.text('Stock', 300, y);
            doc.text('Cost', 350, y);
            doc.text('Value', 400, y);
            doc.font('Helvetica');
            y += 15;

            products.forEach(p => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                doc.text(p.id.toString(), 50, y);
                doc.text(p.name.substring(0, 35), 80, y);
                doc.text(p.stock_quantity.toString(), 300, y);
                doc.text(`Rs. ${Number(p.price_cost).toFixed(2)}`, 350, y);
                doc.text(`Rs. ${(p.stock_quantity * p.price_cost).toFixed(2)}`, 400, y);
                y += 15;
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

// Send Email
const sendReport = async (type) => {
    try {
        const settings = await getSettings();
        if (!settings.email_user || !settings.email_pass || !settings.report_recipient) {
            console.log('Email settings incomplete, skipping report.');
            return;
        }

        const transporter = await createTransporter(settings);
        let pdfBuffer;
        let subject;
        let filename;

        if (type === 'daily') {
            pdfBuffer = await generateDailyReportPDF(new Date());
            subject = `Daily Sales Report - ${new Date().toDateString()}`;
            filename = `sales-report-${Date.now()}.pdf`;
        } else if (type === 'monthly') {
            pdfBuffer = await generateStockReportPDF();
            subject = `Monthly Stock Report - ${new Date().toDateString()}`;
            filename = `stock-report-${Date.now()}.pdf`;
        } else {
            return;
        }

        await transporter.sendMail({
            from: settings.email_user,
            to: settings.report_recipient,
            subject: subject,
            text: `Please find attached the ${type} report.`,
            attachments: [{ filename, content: pdfBuffer }]
        });

        console.log(`${type} report sent successfully to ${settings.report_recipient}`);
    } catch (error) {
        console.error(`Error sending ${type} report:`, error);
    }
};

module.exports = { sendReport, generateStockReportPDF, generateDailyReportPDF };
