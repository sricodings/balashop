import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, InputGroup, Image } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCamera, FaImage, FaTimes } from 'react-icons/fa';
import Webcam from 'react-webcam';

interface Product {
    id: number;
    name: string;
    type: string;
    gender: string;
    size: string;
    color: string;
    price_cost: number;
    price_sell: number;
    stock_quantity: number;
    image_url: string;
    location_in_shop: string;
    description: string;
}

const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const url = searchQuery
                ? `http://localhost:3001/api/inventory/search?q=${searchQuery}`
                : 'http://localhost:3001/api/inventory';
            const response = await axios.get(url);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Update previews when imageFiles change
    useEffect(() => {
        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageFiles]);

    const handleSave = async () => {
        const formData = new FormData();
        Object.entries(currentProduct).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        imageFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            if (currentProduct.id) {
                await axios.put(`http://localhost:3001/api/inventory/${currentProduct.id}`, formData);
            } else {
                await axios.post('http://localhost:3001/api/inventory', formData);
            }
            setShowModal(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error('Error saving product', error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:3001/api/inventory/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    const resetForm = () => {
        setCurrentProduct({});
        setImageFiles([]);
        setPreviews([]);
    };

    const openModal = (product?: Product) => {
        if (product) {
            setCurrentProduct(product);
        } else {
            setCurrentProduct({
                type: 'shoe',
                gender: 'unisex',
                stock_quantity: 0,
                price_cost: 0,
                price_sell: 0
            });
        }
        setImageFiles([]);
        setPreviews([]);
        setShowModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const capturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setImageFiles(prev => [...prev, file]);
                    setShowCamera(false);
                });
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // ... (existing effects)

    const viewDetails = (product: Product) => {
        setSelectedProduct(product);
        setShowDetailsModal(true);
    };

    const downloadPDF = () => {
        window.open('http://localhost:3001/api/settings/download-stock-pdf', '_blank');
    };

    // Helper to prevent row click when clicking actions
    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Container fluid className="p-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-cyan fw-bold">Inventory Management</h2>
                <div className="d-flex gap-2">
                    <Button variant="danger" onClick={downloadPDF} className="shadow-sm">
                        <FaTimes className="me-2" style={{ transform: 'rotate(45deg)' }} /> Download Report (PDF)
                    </Button>
                    <Button variant="primary" onClick={() => openModal()} className="shadow-sm">
                        <FaPlus className="me-2" /> Add New Stock
                    </Button>
                </div>
            </div>

            <Card className="mb-4 shadow-sm border-secondary bg-card">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-dark border-secondary text-secondary">
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by name, type, color..."
                            className="bg-dark text-light border-secondary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-secondary bg-card">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle text-light">
                            <thead>
                                <tr>
                                    <th className="ps-4">Product</th>
                                    <th>Category</th>
                                    <th>Specs</th>
                                    <th>Price (Sell)</th>
                                    <th>Stock</th>
                                    <th>Location</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} onClick={() => viewDetails(p)} style={{ cursor: 'pointer' }}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                {p.image_url ? (
                                                    <img src={`http://localhost:3001${p.image_url}`} alt={p.name} className="result-image rounded me-3 border border-secondary" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="rounded me-3 bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: '50px', height: '50px' }}>No Img</div>
                                                )}
                                                <div>
                                                    <h6 className="mb-0 text-cyan">{p.name}</h6>
                                                    <small className="text-secondary">ID: {p.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="info" className="me-1 text-dark">{p.type}</Badge>
                                            <Badge bg="secondary">{p.gender}</Badge>
                                        </td>
                                        <td>
                                            <div className="small text-light">Size: {p.size}</div>
                                            <div className="small text-secondary">Color: {p.color}</div>
                                        </td>
                                        <td className="fw-bold text-success">₹{Number(p.price_sell).toFixed(2)}</td>
                                        <td>
                                            <Badge bg={p.stock_quantity < 5 ? 'danger' : 'success'}>
                                                {p.stock_quantity}
                                            </Badge>
                                        </td>
                                        <td><small className="text-light">{p.location_in_shop}</small></td>
                                        <td className="text-end pe-4" onClick={handleActionClick}>
                                            <Button variant="link" className="text-info p-0 me-3" onClick={() => openModal(p)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(p.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4 text-secondary">No products found. Add some stock!</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Product Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" className="theme-dark" centered>
                <Modal.Header closeButton className="border-secondary bg-card">
                    <Modal.Title className="text-cyan">Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-card text-light">
                    {selectedProduct && (
                        <Row>
                            <Col md={5}>
                                <div className="p-2 border border-secondary rounded">
                                    {selectedProduct.image_url ? (
                                        <img src={`http://localhost:3001${selectedProduct.image_url}`} alt={selectedProduct.name} className="img-fluid rounded" />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center bg-dark text-secondary" style={{ height: 300 }}>
                                            No Image Available
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={7}>
                                <h3 className="fw-bold text-light mb-3">{selectedProduct.name}</h3>
                                <div className="mb-3">
                                    <Badge bg="primary" className="me-2">{selectedProduct.type}</Badge>
                                    <Badge bg="secondary" className="me-2">{selectedProduct.gender}</Badge>
                                    <Badge bg={selectedProduct.stock_quantity < 5 ? 'danger' : 'success'}>
                                        {selectedProduct.stock_quantity} in stock
                                    </Badge>
                                </div>
                                <h4 className="text-cyan fw-bold mb-4">₹{Number(selectedProduct.price_sell).toFixed(2)}</h4>

                                <Row className="mb-3">
                                    <Col xs={6}><strong className="text-secondary">Size:</strong> <span className="text-light">{selectedProduct.size}</span></Col>
                                    <Col xs={6}><strong className="text-secondary">Color:</strong> <span className="text-light">{selectedProduct.color}</span></Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={6}><strong className="text-secondary">Cost Price:</strong> <span className="text-light">₹{Number(selectedProduct.price_cost).toFixed(2)}</span></Col>
                                    <Col xs={6}><strong className="text-secondary">Location:</strong> <span className="text-light">{selectedProduct.location_in_shop}</span></Col>
                                </Row>

                                <div className="mb-4">
                                    <strong className="text-secondary d-block mb-1">Description:</strong>
                                    <p className="text-light bg-dark p-2 rounded border border-secondary">{selectedProduct.description || 'No description provided.'}</p>
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="info" onClick={() => { setShowDetailsModal(false); openModal(selectedProduct); }}>
                                        <FaEdit className="me-2" /> Edit
                                    </Button>
                                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                                        Close
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="theme-dark">
                <Modal.Header closeButton className="border-secondary bg-card">
                    <Modal.Title>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-card text-light">
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="text" value={currentProduct.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select className="bg-input text-light border-secondary" value={currentProduct.type || 'shoe'} onChange={e => setCurrentProduct({ ...currentProduct, type: e.target.value })}>
                                        <option value="shoe">Shoe</option>
                                        <option value="slipper">Slipper</option>
                                        <option value="sandal">Sandal</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select className="bg-input text-light border-secondary" value={currentProduct.gender || 'unisex'} onChange={e => setCurrentProduct({ ...currentProduct, gender: e.target.value })}>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="kids">Kids</option>
                                        <option value="unisex">Unisex</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Size</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="text" value={currentProduct.size || ''} onChange={e => setCurrentProduct({ ...currentProduct, size: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Color</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="text" value={currentProduct.color || ''} onChange={e => setCurrentProduct({ ...currentProduct, color: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cost Price</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="number" value={currentProduct.price_cost || 0} onChange={e => setCurrentProduct({ ...currentProduct, price_cost: Number(e.target.value) })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Selling Price</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="number" value={currentProduct.price_sell || 0} onChange={e => setCurrentProduct({ ...currentProduct, price_sell: Number(e.target.value) })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="number" value={currentProduct.stock_quantity || 0} onChange={e => setCurrentProduct({ ...currentProduct, stock_quantity: Number(e.target.value) })} />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location in Shop</Form.Label>
                                    <Form.Control className="bg-input text-light border-secondary" type="text" placeholder="e.g. Rack 5, Shelf A" value={currentProduct.location_in_shop || ''} onChange={e => setCurrentProduct({ ...currentProduct, location_in_shop: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control className="bg-input text-light border-secondary" as="textarea" rows={2} value={currentProduct.description || ''} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Images</Form.Label>
                            <div className="d-flex gap-2 mb-2">
                                <Button variant="secondary" onClick={() => document.getElementById('fileInput')?.click()}>
                                    <FaImage className="me-2" /> Upload Photos
                                </Button>
                                <Button variant="info" onClick={() => setShowCamera(true)}>
                                    <FaCamera className="me-2" /> Take Photo
                                </Button>
                                <input
                                    id="fileInput"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Preview Grid */}
                            <div className="d-flex flex-wrap gap-2">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="position-relative">
                                        <Image src={src} thumbnail style={{ width: 80, height: 80, objectFit: 'cover' }} />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 p-0 rounded-circle"
                                            style={{ width: 20, height: 20, fontSize: 10 }}
                                            onClick={() => removeImage(idx)}
                                        >
                                            <FaTimes />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-secondary bg-card">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Stock</Button>
                </Modal.Footer>
            </Modal>

            {/* Camera Modal */}
            <Modal show={showCamera} onHide={() => setShowCamera(false)} size="lg" centered className="theme-dark">
                <Modal.Header closeButton className="bg-card border-secondary">
                    <Modal.Title>Capture Photo</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-card text-center">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        videoConstraints={{ facingMode: "environment" }}
                    />
                </Modal.Body>
                <Modal.Footer className="bg-card border-secondary justify-content-center">
                    <Button variant="info" onClick={capturePhoto} className="btn-lg rounded-circle shadow-glow p-3">
                        <FaCamera size={30} />
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Inventory;
