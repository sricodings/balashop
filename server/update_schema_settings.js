const db = require('./db');

async function updateSchema() {
    try {
        console.log('Creating settings table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                key_name VARCHAR(50) UNIQUE NOT NULL,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default settings if not exist
        const defaults = [
            ['email_service', 'gmail'], // or 'smtp'
            ['email_user', 'striker.shop.report@gmail.com'], // Placeholder
            ['email_pass', 'your_app_password'],
            ['daily_report_time', '23:00'], // 11 PM
            ['monthly_report_time', '07:00'], // 7 AM
            ['report_recipient', 'admin@example.com']
        ];

        for (const [key, val] of defaults) {
            await db.query('INSERT IGNORE INTO settings (key_name, value) VALUES (?, ?)', [key, val]);
        }

        console.log('Settings table created and defaults inserted.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
