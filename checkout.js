let selectedMethod = null;
let cartItems = [];
let orderTotal = 0;
let subtotal = 0;

const BACKEND_URL = 'https://quickbite-backend-z57f.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
});

function loadCartData() {
    cartItems = JSON.parse(localStorage.getItem('quickbite_cart')) || [];
    
    orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 0;
    
    if (cartItems.length > 0 && orderTotal === 0) {
        subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
        orderTotal = subtotal;
    } else {
        subtotal = orderTotal;
    }
    
    if (cartItems.length > 0) {
        displayOrderSummary(cartItems);
        document.getElementById('pay-total').textContent = orderTotal.toFixed(2);
    } else {
        showErrorAndRedirect();
    }
}

function displayOrderSummary(items) {
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    let calculatedSubtotal = 0;
    const groupedItems = {};
    
    items.forEach(item => {
        const itemName = item.name || 'Item';
        const itemPrice = parseFloat(item.price) || 0;
        
        if (!groupedItems[itemName]) {
            groupedItems[itemName] = { count: 1, price: itemPrice };
        } else {
            groupedItems[itemName].count++;
        }
    });
    
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
    
    if (subtotal === 0 && calculatedSubtotal > 0) {
        subtotal = calculatedSubtotal;
        orderTotal = subtotal;
    }
    
    document.getElementById('pay-total').textContent = orderTotal.toFixed(2);
}

function selectPaymentMethod(method) {
    selectedMethod = method;
    
    document.getElementById('online-option').classList.remove('selected');
    document.getElementById('counter-option').classList.remove('selected');
    
    if (method === 'online') {
        document.getElementById('online-option').classList.add('selected');
    } else {
        document.getElementById('counter-option').classList.add('selected');
    }
    
    updateConfirmButton();
}

function updateConfirmButton() {
    const confirmBtn = document.getElementById('main-btn');
    
    if (selectedMethod) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fas fa-check-circle"></i> Confirm ${selectedMethod === 'online' ? 'UPI' : 'Counter'} Payment`;
    } else {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Select Payment Method';
    }
}

async function confirmOrder() {
    const now = new Date();
    const hour = now.getHours();
    // 🕒 UPDATED: 9 AM to 9 PM
    if (hour < 9 || hour >= 21) {
        alert('🕒 Canteen is closed! Open 9 AM - 9 PM.');
        return;
    }
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }
    
    if (cartItems.length === 0) {
        alert('No items in cart!');
        return;
    }
    
    // Get the most recent order from previousOrders
    let previousOrders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    if (previousOrders.length === 0) {
        alert('No order found! Please go back to menu.');
        return;
    }
    
    const latestOrder = previousOrders[previousOrders.length - 1];
    
    // Update payment method in the order
    latestOrder.method = selectedMethod;
    latestOrder.paymentTime = new Date().toLocaleTimeString();
    latestOrder.paymentDate = new Date().toLocaleDateString();
    
    // Save updated order
    localStorage.setItem('previousOrders', JSON.stringify(previousOrders));
    
    // Also update allOrders
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const orderIndex = allOrders.findIndex(o => o.token === latestOrder.token);
    if (orderIndex !== -1) {
        allOrders[orderIndex].method = selectedMethod;
        allOrders[orderIndex].paymentTime = latestOrder.paymentTime;
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
    }
    
    console.log('Payment confirmed for order:', latestOrder);
    
    // Clear cart
    localStorage.removeItem('quickbite_cart');
    localStorage.removeItem('orderTotal');
    localStorage.removeItem('totalPrice');
    
    // Show success message
    showSuccessMessage(latestOrder);
}

function showSuccessMessage(order) {
    const successMsg = document.getElementById('success-message');
    
    let displayText = '';
    if (order.orderType === 'dinein' && order.tableNumber) {
        displayText = `Table ${order.tableNumber} | Token: ${order.token}`;
    } else {
        displayText = order.token;
    }
    
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i> Payment Successful!<br>
        <small>${displayText} | Total: ₹${order.amount.toFixed(2)}</small>
    `;
    successMsg.classList.add('show');
    
    document.getElementById('main-btn').disabled = true;
    
    if (selectedMethod === 'online') {
        const upiUrl = `upi://pay?pa=9999999999@paytm&pn=QuickBite&am=${order.amount.toFixed(2)}&tn=Order%20${order.orderId || order.token}&cu=INR`;
        window.location.href = upiUrl;
    }
    
    setTimeout(() => window.location.href = 'previous-orders.html', 3000);
}

function showErrorAndRedirect() {
    const summary = document.getElementById('order-summary');
    summary.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle" style="color: #d63031;"></i> No Items Found</h3>
        <p style="text-align: center; padding: 20px; color: #666;">Your cart is empty. Redirecting...</p>
    `;
    
    setTimeout(() => window.location.href = 'menu.html', 2000);
}

function goBackToMenu() {
    window.location.href = 'menu.html';
}

window.selectPaymentMethod = selectPaymentMethod;
window.confirmOrder = confirmOrder;
window.goBackToMenu = goBackToMenu;