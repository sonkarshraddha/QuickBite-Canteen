const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000; // THIS WAS MISSING!

// 1. Middlewares
app.use(cors());
app.use(express.json());
// 1. Middlewares
app.use(cors());
app.use(express.json());

// ===== ADD THESE TEST ROUTES HERE =====
app.get('/', (req, res) => {
    res.send('🚀 QuickBite Backend is running!');
});

app.get('/test', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'Server is working!',
        time: new Date().toLocaleString()
    });
});
// ======================================

// 2. MongoDB Connection
mongoose.connect('mongodb+srv://shraddhasonkar0000_db_user:fYsxlRU2IG8sQzOy@cluster1.nifjyyc.mongodb.net/Quickbite?retryWrites=true&w=majority&appName=Cluster1', {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000
})
.then(() => console.log('✅ Connected to MongoDB!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. MongoDB Connection - Cloud Atlas
const MONGODB_URI = 'mongodb+srv://shraddhasonkar0000_db_user:fYsxlRU2IG8sQzOy@cluster1.nifjyyc.mongodb.net/Quickbite?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000
})
.then(() => console.log('✅ Connected to MongoDB Atlas!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3a. User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rollNo:   { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 3b. Order Schema
const orderSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    items: Array,
    totalAmount: Number,
    tableNumber: String,
    status: { type: String, default: 'Pending' },
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// 4a. Registration Route
app.post('/register', async (req, res) => {
    try {
        const { fullName, rollNo, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered!" });

        const newUser = new User({ fullName, rollNo, email, password });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message });
    }
});

// 4b. Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        res.status(200).json({ 
            message: "Login successful!", 
            user: { fullName: user.fullName, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
});

// 4c. Place Order Route
app.post('/place-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully! Admin is notified." });
    } catch (error) {
        console.error("Order Save Error:", error);
        res.status(500).json({ message: "Failed to send order to admin." });
    }
});

// 4d. Get Orders Route
app.get('/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch orders." });
    }
});

// 5. Start Server - FIXED VERSION
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://192.168.0.100:${PORT}`);
    console.log(`📱 Access from mobile: http://192.168.0.100:${PORT}`);
});