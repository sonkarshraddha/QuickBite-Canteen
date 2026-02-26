const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/Quickbite')
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3a. User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rollNo:   { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 3b. THE BRIDGE: Order Schema (Stores student orders for the admin)
const orderSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    items: Array,        // Stores the list of food items
    totalAmount: Number,
    tableNumber: String,
    status: { type: String, default: 'Pending' }, // Admin can change this to 'Completed'
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// 4a. Registration & Login Routes
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

// 4b. THE BRIDGE: Order Routes
// STUDENT SIDE: Sends order data to the database
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

// ADMIN SIDE: Gets all orders from the database to display in the admin panel
app.get('/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 }); // Newest orders first
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch orders." });
    }
});

// 5. Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});