const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ========== SIMPLE TEST ROUTES ==========
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
// ========================================

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://shraddhasonkar0000_db_user:fYsxlRU2IG8sQzOy@cluster1.nifjyyc.mongodb.net/Quickbite?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000
})
.then(() => console.log('✅ Connected to MongoDB Atlas!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rollNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Order Schema
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

// ========== REGISTER ROUTE ==========
app.post('/register', async (req, res) => {
    console.log('📝 Register attempt:', req.body);
    
    try {
        const { fullName, rollNo, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Create new user
        const newUser = new User({ fullName, rollNo, email, password });
        await newUser.save();
        
        console.log('✅ User registered:', email);
        res.status(201).json({ message: "Registration successful!" });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: "Error: " + error.message });
    }
});

// ========== LOGIN ROUTE (FIXED) ==========
// ========== LOGIN ROUTE (FIXED) ==========
app.post('/login', async (req, res) => {
    console.log('🔐 Login attempt:', req.body);
    
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        // If user doesn't exist
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        
        // Check password
        if (user.password !== password) {
            console.log('❌ Wrong password for:', email);
            console.log('Stored:', user.password);
            console.log('Provided:', password);
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        
        // Success!
        console.log('✅ Login successful for:', email);
        res.status(200).json({ 
            message: "Login successful!", 
            user: { 
                fullName: user.fullName, 
                email: user.email 
            } 
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// ========== DEBUG ROUTE - Check user ==========
app.post('/debug-user', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (user) {
            res.json({
                exists: true,
                email: user.email,
                fullName: user.fullName,
                storedPassword: user.password,
                message: 'User found'
            });
        } else {
            res.json({
                exists: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== GET ALL USERS (for testing) ==========
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'email fullName');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Order Routes
app.post('/place-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!" });
    } catch (error) {
        console.error("Order Save Error:", error);
        res.status(500).json({ message: "Failed to send order." });
    }
});

app.get('/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch orders." });
    }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://192.168.0.100:${PORT}`);
    console.log(`📱 Access from mobile: http://192.168.0.100:${PORT}`);
    console.log(`🌐 Public URL: https://quickbite-backend-z577.onrender.com`);
});