import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaChartLine, FaBox, FaCashRegister, FaCog } from 'react-icons/fa';

interface NavigationProps {
    onLogout: () => void;
    user: { username: string, role: string };
}

const Navigation = ({ onLogout, user }: NavigationProps) => {
    const location = useLocation();

    return (
        <Navbar expand="lg" variant="dark" className="navbar-custom py-3 shadow">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <span className="text-cyan me-2">STRIKER</span> SHOP
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
                            <FaChartLine className="me-1" /> Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/inventory" active={location.pathname === '/inventory'}>
                            <FaBox className="me-1" /> Inventory
                        </Nav.Link>
                        <Nav.Link as={Link} to="/sales" active={location.pathname === '/sales'}>
                            <FaCashRegister className="me-1" /> POS / Sales
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'}>
                            <FaCog className="me-1" /> Admin
                        </Nav.Link>
                    </Nav>
                    <Nav className="ms-auto align-items-center">
                        <span className="text-light me-3">Welcome, {user.username}</span>
                        <Button variant="outline-info" size="sm" onClick={onLogout}>
                            <FaSignOutAlt className="me-1" /> Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
