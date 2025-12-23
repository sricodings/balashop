import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaShoppingCart, FaSearch, FaTrash, FaCheckCircle } from 'react-icons/fa';

interface Product {
    id: number;
    name: string;
    price_sell: number;
    stock_quantity: number;
    image_url: string;
    size: string;
    color: string;
}

interface CartItem extends Product {
    qty: number;
}

const Sales = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [successMsg, setSuccessMsg] = useState('');

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (searchQuery.length > 0) {
            searchProducts();
        } else {
            setProducts([]); // Clear products if search empty
            setErrorMsg('');
        }
    }, [searchQuery]);

    const searchProducts = async () => {
        try {
            setErrorMsg('');
            const response = await axios.get(`http://localhost:3001/api/inventory/search?q=${searchQuery}`);
            setProducts(response.data);
        } catch (error) {
            console.error(error);
            setErrorMsg('Error fetching products. Ensure server is running.');
            setProducts([]);
        }
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.qty + 1 > product.stock_quantity) {
                alert('Not enough stock!');
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            if (product.stock_quantity < 1) {
                alert('Out of stock!');
                return;
            }
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQty = (id: number, qty: number) => {
        const product = products.find(p => p.id === id) || cart.find(p => p.id === id); // Fallback to cart for stock check if search changed
        if (product && qty > product.stock_quantity) {
            alert('Not enough stock!');
            return;
        }
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, qty: qty } : item));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price_sell * item.qty), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            // Process each item sequentially (simple approach) or batch
            // The API expects single sale record.
            // For this 'full shop system', we really should have a 'Order' with multiple line items.
            // But the current backend `sales` table is per-item (simple).
            // I will loop through cart and record each. In a real highly pro app, we'd have Orders & OrderItems tables.
            // I'll stick to the requested structure constraints (implied simple logic) but making it work.

            for (const item of cart) {
                await axios.post('http://localhost:3001/api/sales', {
                    product_id: item.id,
                    quantity: item.qty,
                    sale_price: item.price_sell
                });
            }

            setSuccessMsg('Sale completed successfully!');
            setCart([]);
            setSearchQuery('');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Checkout error', error);
            alert('Error processing sale. check console.');
        }
    };

    return (
        <Container fluid className="p-4 animate-fade-in">
            <h2 className="mb-4 text-cyan fw-bold">Point of Sale (POS)</h2>
            {successMsg && <Alert variant="success"><FaCheckCircle className="me-2" />{successMsg}</Alert>}

            <Row>
                <Col md={7}>
                    <Card className="mb-4 shadow-sm bg-card border-secondary">
                        <Card.Body>
                            <Form.Control
                                type="text"
                                placeholder="Scan Barcode / Search Product..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="form-control-lg mb-3 bg-dark text-light border-secondary"
                                autoFocus
                            />

                            {searchQuery && (
                                <ListGroup className="bg-dark">
                                    {products.map(p => (
                                        <ListGroup.Item key={p.id} action onClick={() => addToCart(p)} className="d-flex justify-content-between align-items-center bg-dark text-light border-secondary hover-dark">
                                            <div className="d-flex align-items-center">
                                                {p.image_url && <img src={`http://localhost:3001${p.image_url}`} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10 }} className="rounded" />}
                                                <div>
                                                    <div className="fw-bold text-cyan">{p.name}</div>
                                                    <small className="text-secondary">{p.color} | Size: {p.size}</small>
                                                </div>
                                            </div>
                                            <div>
                                                <Badge bg={p.stock_quantity > 0 ? "success" : "danger"} className="me-2">
                                                    Stock: {p.stock_quantity}
                                                </Badge>
                                                <span className="fw-bold text-light">₹{p.price_sell}</span>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                    {products.length === 0 && searchQuery && !errorMsg && <div className="text-secondary p-2">No products found</div>}
                                    {errorMsg && <div className="text-danger p-2">{errorMsg}</div>}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="text-center text-muted mt-5">
                        <FaSearch size={50} className="mb-3 opacity-25 text-secondary" />
                        <p className="text-secondary">Search for products to add to the cart.</p>
                    </div>
                </Col>

                <Col md={5}>
                    <Card className="shadow-lg h-100 border-secondary bg-card">
                        <Card.Header className="bg-dark text-cyan d-flex justify-content-between align-items-center py-3 border-secondary">
                            <h5 className="mb-0"><FaShoppingCart className="me-2" /> Current Sale</h5>
                            <Badge bg="secondary" text="light">{cart.length} Items</Badge>
                        </Card.Header>
                        <Card.Body className="p-0 d-flex flex-column" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <Table striped hover responsive className="mb-0 text-light" variant="dark">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th style={{ width: '20%' }}>Qty</th>
                                        <th className="text-end">Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="fw-bold text-light">{item.name}</div>
                                                <small className="text-secondary">₹{item.price_sell} each</small>
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    value={item.qty}
                                                    onChange={(e) => updateQty(item.id, Number(e.target.value))}
                                                    min="1"
                                                    className="bg-dark text-light border-secondary"
                                                />
                                            </td>
                                            <td className="text-end fw-bold text-cyan">
                                                ₹{(item.price_sell * item.qty).toFixed(2)}
                                            </td>
                                            <td className="text-end">
                                                <Button variant="link" className="text-danger p-0" onClick={() => removeFromCart(item.id)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-5 text-secondary">
                                                Cart is empty
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="bg-dark border-top border-secondary p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-secondary">Total</h4>
                                <h2 className="mb-0 fw-bold text-cyan">₹{calculateTotal().toFixed(2)}</h2>
                            </div>
                            <Button
                                variant="info"
                                size="lg"
                                className="w-100 text-white fw-bold py-3 shadow-glow"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                            >
                                COMPLETE SALE
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Sales;
