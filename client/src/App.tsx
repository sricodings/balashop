import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import AdminSettings from './components/AdminSettings';

function App() {
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);

    useEffect(() => {
        // Check local storage for user (simple persistence)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (userData: { username: string, role: string }) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const getHomeRoute = () => {
        if (!user) return "/login";
        if (user.role === 'cashier') return "/sales";
        return "/dashboard";
    };

    return (
        <Router>
            <div className="min-vh-100 d-flex flex-column">
                {user && <Navigation onLogout={handleLogout} user={user} />}
                <div className="container-fluid flex-grow-1 p-0">
                    <Routes>
                        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={getHomeRoute()} />} />
                        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
                        <Route path="/sales" element={user ? <Sales /> : <Navigate to="/login" />} />
                        <Route path="/admin" element={user ? <AdminSettings /> : <Navigate to="/login" />} />
                        <Route path="/" element={<Navigate to={getHomeRoute()} />} />
                    </Routes>
                </div>
                <footer className="bg-navy text-white text-center py-3 mt-auto">
                    <small>&copy; {new Date().getFullYear()} Striker Shop Management System</small>
                </footer>
            </div>
        </Router>
    );
}

export default App;
