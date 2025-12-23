import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaCog, FaPaperPlane, FaSave } from 'react-icons/fa';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        email_user: '',
        email_pass: '',
        report_recipient: '',
        daily_report_time: '23:00',
        monthly_report_time: '07:00'
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/settings');
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/settings/update', settings);
            setMsg('Settings saved successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Failed to save');
        }
    };

    const sendTest = async (type: string) => {
        try {
            alert(`Sending ${type} report... Check server console/logs.`);
            await axios.post('http://localhost:3001/api/settings/send-test', { type });
        } catch (err) {
            alert('Error sending test email');
        }
    };

    return (
        <Container className="p-4 animate-fade-in">
            <h2 className="text-cyan fw-bold mb-4"><FaCog className="me-2" /> Admin Settings</h2>
            {msg && <Alert variant="success">{msg}</Alert>}

            <Card className="bg-card border-secondary shadow-sm text-light">
                <Card.Header className="bg-dark border-secondary">Email Configuration (SMTP)</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSave}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sender Email (Gmail)</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email_user"
                                        value={settings.email_user}
                                        onChange={handleChange}
                                        className="bg-dark text-light border-secondary"
                                        placeholder="your.email@gmail.com"
                                    />
                                    <Form.Text className="text-muted">
                                        Use a Gmail account with App Password enabled.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>App Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="email_pass"
                                        value={settings.email_pass}
                                        onChange={handleChange}
                                        className="bg-dark text-light border-secondary"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Recipient Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="report_recipient"
                                        value={settings.report_recipient}
                                        onChange={handleChange}
                                        className="bg-dark text-light border-secondary"
                                        placeholder="admin@example.com"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="border-secondary" />
                        <h5 className="mb-3 text-cyan">Schedule Configuration</h5>
                        <Alert variant="info" className="bg-dark border-info text-info">
                            Note: Currently cron jobs are hardcoded to 11 PM and 7 AM (1st of month).
                            Changing these times here will update the DB but requires server restart/logic update to take effect dynamically (Not fully implemented dynamically yet).
                        </Alert>

                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button variant="outline-warning" onClick={() => sendTest('daily')}>
                                <FaPaperPlane className="me-2" /> Test Daily Report
                            </Button>
                            <Button variant="outline-warning" onClick={() => sendTest('monthly')}>
                                <FaPaperPlane className="me-2" /> Test Monthly Report
                            </Button>
                            <Button variant="primary" type="submit">
                                <FaSave className="me-2" /> Save Settings
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminSettings;
