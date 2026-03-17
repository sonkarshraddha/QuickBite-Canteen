// Payment method selection
let selectedMethod = null;
let cartItems = [];
let orderTotal = 0;
let subtotal = 0;

// Load order data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    
    // Add input listener for token field
    document.getElementById('student-token').addEventListener('input', function() {
        updateConfirmButton();
    });
});

// Load cart data from localStorage
function loadCartData() {
    // Check multiple possible cart keys
    cartItems = JSON.parse(localStorage.getItem('quickbite_cart')) || 
                JSON.parse(localStorage.getItem('checkout_cart')) || 
                [];
    
    // Try different total keys
    orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 
                 parseFloat(localStorage.getItem('checkout_total')) || 
                 parseFloat(localStorage.getItem('totalPrice')) || 
                 0;
    
    // Calculate subtotal from items if needed
    if (cartItems.length > 0 && orderTotal === 0) {
        subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
        orderTotal = subtotal;
    } else {
        subtotal = orderTotal;
    }
    
    console.log('Loaded cart:', cartItems);
    console.log('Total:', orderTotal);
    
    // Display order if items exist
    if (cartItems.length > 0) {
        displayOrderSummary(cartItems);
        document.getElementById('pay-total').textContent = orderTotal.toFixed(2);
    } else {
        // No items found - show error and redirect
        showErrorAndRedirect();
    }
}

function showErrorAndRedirect() {
    const summary = document.getElementById('order-summary');
    summary.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle" style="color: #d63031;"></i> No Items Found</h3>
        <p style="text-align: center; padding: 20px; color: #666;">
            Your cart is empty. Redirecting to menu...
        </p>
    `;
    
    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 2000);
}

// Display order summary - NO GST, NO Service Tax
function displayOrderSummary(items) {
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    let calculatedSubtotal = 0;
    
    // Group items by name to show quantities
    const groupedItems = {};
    items.forEach(item => {
        const itemName = item.name || 'Item';
        const itemPrice = parseFloat(item.price) || 0;
        
        if (!groupedItems[itemName]) {
            groupedItems[itemName] = {
                count: 1,
                price: itemPrice
            };
        } else {
            groupedItems[itemName].count++;
        }
    });
    
    // Display each item and calculate subtotal
    Object.entries(groupedItems).forEach(([name, data]) => {
        const itemTotal = data.price * data.count;
        calculatedSubtotal += itemTotal;
        itemsList.innerHTML += `
            <div class="order-item">
                <span>${name} x${data.count}</span>
                <span>₹${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    // Use the calculated subtotal if the stored one is 0
    if (subtotal === 0 && calculatedSubtotal > 0) {
        subtotal = calculatedSubtotal;
        orderTotal = subtotal;
    }
    
    // NO GST, NO Service Tax - just show subtotal
    const finalTotal = subtotal;
    orderTotal = finalTotal;
    
    // Update total display
    document.getElementById('pay-total').textContent = finalTotal.toFixed(2);
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
    // Check if canteen is open (11 AM - 6 PM)
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11 || hour >= 18) {
        alert('🕒 Canteen is closed! Orders can only be placed between 11 AM - 6 PM.');
        return;
    }
    
    const token = document.getElementById('student-token').value.trim();
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }
    
    if (!token) {
        alert('Please enter your token/table number');
        return;
    }
    
    if (cartItems.length === 0) {
        alert('No items in cart!');
        return;
    }
    
    // NO GST, NO Service Tax - just use subtotal
    const finalAmount = subtotal;
    
    // Create order object
    const orderData = {
        token: token,
        items: cartItems.map(item => ({
            name: item.name || 'Item',
            price: parseFloat(item.price) || 0,
            quantity: 1
        })),
        subtotal: subtotal,
        amount: finalAmount, // This is just subtotal (no taxes)
        method: selectedMethod,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Processing',
        orderId: 'ORD' + Date.now()
    };
    
    // Save order to allOrders (for admin)
    saveOrder(orderData);
    
    // Show success message
    showSuccessMessage(orderData);
}

// Save order to allOrders
function saveOrder(order) {
    // Get existing orders
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    
    // Add new order
    allOrders.push(order);
    
    // Save to allOrders
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    
    // Also save to previousOrders for user view
    let previousOrders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    previousOrders.push(order);
    localStorage.setItem('previousOrders', JSON.stringify(previousOrders));
    
    console.log('Order saved:', order);
}

// Show success message and redirect
function showSuccessMessage(order) {
    const successMsg = document.getElementById('success-message');
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i> Order Confirmed!<br>
        <small>Token #${order.token} | Total: ₹${order.amount.toFixed(2)}</small>
    `;
    successMsg.classList.add('show');
    
    // Disable confirm button
    document.getElementById('main-btn').disabled = true;
    
    // Clear cart from localStorage (check all possible keys)
    localStorage.removeItem('quickbite_cart');
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('canteenCart');
    localStorage.removeItem('orderTotal');
    localStorage.removeItem('checkout_total');
    localStorage.removeItem('checkout_subtotal');
    localStorage.removeItem('totalPrice');
    
    // Redirect to previous orders page after 2 seconds
    setTimeout(() => {
        window.location.href = 'previous-orders.html';
    }, 2000);
}

// Go back to menu
function goBackToMenu() {
    window.location.href = 'menu.html';
}