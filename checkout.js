// Payment method selection
let selectedMethod = null;
let orderData = null;

// Load order data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    
    // Add input listener for token field
    document.getElementById('student-token').addEventListener('input', function() {
        updateConfirmButton();
    });
});

// Load order data from localStorage
function loadOrderData() {
    // Try to get current order first
    orderData = JSON.parse(localStorage.getItem('currentOrder'));
    
    // If no current order, try to get from cart
    if (!orderData) {
        const cart = JSON.parse(localStorage.getItem('quickbite_cart')) || [];
        const total = localStorage.getItem('orderTotal') || 0;
        
        if (cart.length > 0) {
            orderData = {
                token: 'TK' + Math.floor(Math.random() * 1000),
                items: cart.map(item => ({
                    name: item.name || item,
                    price: typeof item === 'object' ? item.price : 0,
                    quantity: 1
                })),
                amount: parseFloat(total),
                method: 'pending',
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'Processing' // Changed from 'Pending' to 'Processing'
            };
        }
    }
    
    // Display order if exists
    if (orderData && orderData.items && orderData.items.length > 0) {
        displayOrderSummary(orderData);
        document.getElementById('pay-total').textContent = orderData.amount || 0;
    } else {
        // No order found - show error and redirect
        alert('No order found! Please add items to cart first.');
        window.location.href = 'menu.html';
    }
}

// Display order summary
function displayOrderSummary(order) {
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    // Group items by name to show quantities
    const groupedItems = {};
    order.items.forEach(item => {
        const itemName = item.name || 'Item';
        if (!groupedItems[itemName]) {
            groupedItems[itemName] = {
                count: 1,
                price: item.price || 0
            };
        } else {
            groupedItems[itemName].count++;
        }
    });
    
    // Display each item
    Object.entries(groupedItems).forEach(([name, data]) => {
        const itemTotal = data.price * data.count;
        itemsList.innerHTML += `
            <div class="order-item">
                <span>${name} x${data.count}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });
}

// Select payment method
function selectPaymentMethod(method) {
    selectedMethod = method;
    
    // Update UI
    document.getElementById('online-option').classList.remove('selected');
    document.getElementById('counter-option').classList.remove('selected');
    
    if (method === 'online') {
        document.getElementById('online-option').classList.add('selected');
    } else {
        document.getElementById('counter-option').classList.add('selected');
    }
    
    updateConfirmButton();
}

// Update confirm button state
function updateConfirmButton() {
    const token = document.getElementById('student-token').value.trim();
    const confirmBtn = document.getElementById('main-btn');
    
    if (selectedMethod && token.length > 0) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fas fa-check-circle"></i> Confirm ${selectedMethod === 'online' ? 'UPI' : 'Counter'} Payment`;
    } else {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Enter Token & Select Payment';
    }
}

// Confirm order
function confirmOrder() {
    const token = document.getElementById('student-token').value.trim();
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }
    
    if (!token) {
        alert('Please enter your token/table number');
        return;
    }
    
    if (!orderData) {
        alert('Order data not found!');
        return;
    }
    
    // Update order with payment details
    orderData.token = token;
    orderData.method = selectedMethod;
    orderData.status = 'Processing'; // Set status to Processing
    orderData.paymentTime = new Date().toLocaleTimeString();
    orderData.orderDate = new Date().toLocaleDateString();
    
    // Save to previous orders with Processing status
    saveToPreviousOrders(orderData);
    
    // Process based on payment method
    if (selectedMethod === 'online') {
        processUPIPayment(orderData);
    } else {
        processCounterPayment(orderData);
    }
}

// Save order to previous orders
function saveToPreviousOrders(order) {
    // Get existing previous orders
    let previousOrders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    
    // Add new order with Processing status
    const processingOrder = {
        ...order,
        status: 'Processing', // Set as Processing
        orderId: 'ORD' + Date.now(),
        lastUpdated: new Date().toLocaleTimeString()
    };
    
    previousOrders.push(processingOrder);
    localStorage.setItem('previousOrders', JSON.stringify(previousOrders));
    
    // Also save to allOrders for admin with Processing status
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(processingOrder);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    
    console.log('Order saved with status: Processing', processingOrder);
}

// Process UPI Payment
function processUPIPayment(order) {
    // Show success message
    const successMsg = document.getElementById('success-message');
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i> UPI Payment Successful!<br>
        <small>Order #${order.token} is now Processing</small>
    `;
    successMsg.classList.add('show');
    
    // Disable confirm button
    document.getElementById('main-btn').disabled = true;
    
    // Simulate UPI payment
    setTimeout(() => {
        // Clear current order from localStorage
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('quickbite_cart');
        localStorage.removeItem('orderTotal');
        
        // Show final message with Processing status
        alert(`✅ Order Confirmed!\n\nToken: ${order.token}\nTotal: ₹${order.amount}\nPayment: UPI\nStatus: Processing\n\nYour order is being prepared!`);
        
        // Redirect to previous orders page
        window.location.href = 'previous-orders.html';
    }, 1500);
}

// Process Counter Payment
function processCounterPayment(order) {
    // Show success message
    const successMsg = document.getElementById('success-message');
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i> Order Ready for Counter Payment<br>
        <small>Please pay at counter - Token #${order.token} (Processing)</small>
    `;
    successMsg.classList.add('show');
    
    // Disable confirm button
    document.getElementById('main-btn').disabled = true;
    
    setTimeout(() => {
        // Clear current order from localStorage
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('quickbite_cart');
        localStorage.removeItem('orderTotal');
        
        // Show final message with Processing status
        alert(`✅ Order Placed!\n\nToken: ${order.token}\nTotal: ₹${order.amount}\nPayment: Pay at Counter\nStatus: Processing\n\nPlease pay at the counter to complete your order.`);
        
        // Redirect to previous orders page
        window.location.href = 'previous-orders.html';
    }, 1500);
}