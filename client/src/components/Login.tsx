import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';

interface LoginProps {
    onLogin: (user: { username: string, role: string }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                username,
                password
            });

            onLogin(response.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', width: '100vw' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={4}>
                        <div className="text-center mb-5 animate-fade-in" style={{ zIndex: 1, position: 'relative' }}>
                            <div className="mb-3 d-inline-block p-3 rounded-circle shadow-glow" style={{ border: '2px solid var(--secondary-color)' }}>
                                <span className="display-4 text-cyan">⚡</span>
                            </div>
                            <h2 className="display-5 fw-bold text-white tracking-wider">STRIKER <span className="text-cyan">SHOP</span></h2>
                            <p className="text-secondary fw-light letter-spacing-2">PREMIUM MANAGEMENT SYSTEM</p>
                        </div>

                        <Card className="glass-card shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <Card.Body className="p-5">
                                <h4 className="mb-4 text-center text-light fw-bold">Welcome Back</h4>
                                {error && <Alert variant="danger" className="py-2 text-center small mb-4">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-secondary small text-uppercase fw-bold">Username</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary"><FaUser /></span>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter your username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                className="bg-dark text-light border-secondary py-2"
                                                style={{ borderLeft: 'none' }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-5">
                                        <Form.Label className="text-secondary small text-uppercase fw-bold">Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary"><FaLock /></span>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-dark text-light border-secondary py-2"
                                                style={{ borderLeft: 'none' }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" className="py-3 fw-bold text-uppercase letter-spacing-2 shadow-glow hover-scale">
                                            Access Dashboard
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                            <Card.Footer className="text-center border-0 bg-transparent py-3">
                                <small className="text-muted">Protected System | &copy; {new Date().getFullYear()}</small>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
