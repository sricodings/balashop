import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { FaFileInvoiceDollar, FaBoxOpen, FaExclamationTriangle, FaChartPie } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/dashboard/stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats', error);
            setLoading(false);
        }
    };

    if (loading) return <Container className="p-4 text-center">Loading Dashboard...</Container>;

    if (!stats) return <Container className="p-4 text-center text-danger">Error loading data.</Container>;

    // Prepare chart data
    const salesLabels = stats.recent_sales ? stats.recent_sales.map((s: any) => new Date(s.date).toLocaleDateString()) : [];
    const salesData = stats.recent_sales ? stats.recent_sales.map((s: any) => s.revenue) : [];

    const barData = {
        labels: salesLabels,
        datasets: [
            {
                label: 'Daily Revenue',
                data: salesData,
                backgroundColor: 'rgba(0, 188, 212, 0.6)',
                borderColor: 'rgba(0, 188, 212, 1)',
                borderWidth: 1,
            },
        ],
    };

    const categoryLabels = stats.category_distribution ? stats.category_distribution.map((c: any) => c.type) : [];
    const categoryData = stats.category_distribution ? stats.category_distribution.map((c: any) => c.count) : [];

    const pieData = {
        labels: categoryLabels,
        datasets: [
            {
                data: categoryData,
                backgroundColor: [
                    '#001f3f',
                    '#00bcd4',
                    '#39CCCC',
                    '#0074D9',
                    '#7FDBFF'
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container fluid className="p-4 animate-fade-in">
            <h2 className="mb-4 text-cyan fw-bold">Owners Dashboard</h2>

            <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3">
                    <Card className="h-100 bg-dark-gradient shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-secondary mb-2">Total Stocks</h6>
                                <h3 className="mb-0 text-white">{stats.total_stock}</h3>
                            </div>
                            <FaBoxOpen size={40} className="text-cyan opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="h-100 border-start border-5 border-info shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-secondary mb-2">Total Revenue</h6>
                                <h3 className="mb-0 text-info">₹{Number(stats.total_revenue).toFixed(2)}</h3>
                            </div>
                            <FaFileInvoiceDollar size={40} className="text-info opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="h-100 border-start border-5 border-success shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-secondary mb-2">Total Profit</h6>
                                <h3 className="mb-0 text-success">₹{Number(stats.total_profit).toFixed(2)}</h3>
                            </div>
                            <FaChartPie size={40} className="text-success opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="h-100 border-start border-5 border-danger shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-secondary mb-2">Low Stock Alerts</h6>
                                <h3 className="mb-0 text-danger">{stats.low_stock_alerts}</h3>
                            </div>
                            <FaExclamationTriangle size={40} className="text-danger opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Header className="py-3">
                            <h5 className="mb-0 text-cyan">Sales Trend (Last 7 Days)</h5>
                        </Card.Header>
                        <Card.Body>
                            <Bar data={barData} options={{
                                responsive: true,
                                plugins: {
                                    legend: { labels: { color: '#e0e0e0' } }
                                },
                                scales: {
                                    x: { ticks: { color: '#b0b0b0' }, grid: { color: '#333' } },
                                    y: { ticks: { color: '#b0b0b0' }, grid: { color: '#333' } }
                                }
                            }} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="py-3">
                            <h5 className="mb-0 text-cyan">Inventory Distribution</h5>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div style={{ maxWidth: '300px' }}>
                                <Pie data={pieData} options={{
                                    plugins: { legend: { labels: { color: '#e0e0e0' } } }
                                }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
