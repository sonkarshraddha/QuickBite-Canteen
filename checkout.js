let selectedMethod = null;
let cartItems = [];
let orderTotal = 0;
let subtotal = 0;

// Backend URL
const BACKEND_URL = 'https://quickbite-backend-z57f.onrender.com';

// Load order data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    document.getElementById('student-token').addEventListener('input', updateConfirmButton);
});

function loadCartData() {
    cartItems = JSON.parse(localStorage.getItem('quickbite_cart')) || [];
    orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 0;
    subtotal = orderTotal;
    
    if (cartItems.length > 0) {
        displayOrderSummary(cartItems);
        document.getElementById('pay-total').textContent = orderTotal.toFixed(2);
    } else {
        showErrorAndRedirect();
    }
}

function showErrorAndRedirect() {
    document.getElementById('order-summary').innerHTML = `
        <h3><i class="fas fa-exclamation-triangle" style="color: #d63031;"></i> No Items Found</h3>
        <p style="text-align: center; padding: 20px; color: #666;">Your cart is empty. Redirecting to menu...</p>
    `;
    setTimeout(() => window.location.href = 'menu.html', 2000);
}

function displayOrderSummary(items) {
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    items.forEach(item => {
        itemsList.innerHTML += `
            <div class="order-item">
                <span>${item.name} x1</span>
                <span>₹${item.price}</span>
            </div>
        `;
    });
    
    const gst = subtotal * 0.05;
    const serviceTax = 5;
    const finalTotal = subtotal + gst + serviceTax;
    
    itemsList.innerHTML += `
        <div class="order-item" style="color: #666; border-top: 1px dashed #ddd; margin-top: 10px; padding-top: 10px;">
            <span>Subtotal:</span> <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="order-item" style="color: #666;">
            <span>GST (5%):</span> <span>₹${gst.toFixed(2)}</span>
        </div>
        <div class="order-item" style="color: #666;">
            <span>Service Tax:</span> <span>₹5.00</span>
        </div>
    `;
    
    document.getElementById('pay-total').textContent = finalTotal.toFixed(2);
}

function selectPaymentMethod(method) {
    selectedMethod = method;
    document.getElementById('online-option').classList.remove('selected');
    document.getElementById('counter-option').classList.remove('selected');
    document.getElementById(method === 'online' ? 'online-option' : 'counter-option').classList.add('selected');
    updateConfirmButton();
}

function updateConfirmButton() {
    const token = document.getElementById('student-token').value.trim();
    const btn = document.getElementById('main-btn');
    
    if (selectedMethod && token) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-check-circle"></i> Confirm ${selectedMethod === 'online' ? 'UPI' : 'Counter'} Payment`;
    } else {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-lock"></i> Enter Token & Select Payment';
    }
}

function confirmOrder() {
    const token = document.getElementById('student-token').value.trim();
    
    if (!selectedMethod) { alert('Please select a payment method'); return; }
    if (!token) { alert('Please enter token/table number'); return; }
    if (cartItems.length === 0) { alert('No items in cart!'); return; }

    const gst = subtotal * 0.05;
    const serviceTax = 5;
    const finalAmount = subtotal + gst + serviceTax;
    const orderId = 'ORD' + Date.now();
    
    const orderData = {
        token, items: cartItems, subtotal, gst, serviceTax,
        amount: finalAmount, method: selectedMethod,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Processing', orderId
    };
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('allOrders', JSON.stringify(orders));
    localStorage.setItem('previousOrders', JSON.stringify(orders));
    
    // Save token for success page
    localStorage.setItem('customToken', token);
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Clear cart
    localStorage.removeItem('quickbite_cart');
    localStorage.removeItem('orderTotal');
    
    // Show success message
    document.getElementById('success-message').innerHTML = `
        <i class="fas fa-check-circle"></i> Order Confirmed!<br>
        <small>Token #${token} | Total: ₹${finalAmount.toFixed(2)}</small>
    `;
    document.getElementById('success-message').classList.add('show');
    document.getElementById('main-btn').disabled = true;
    
    // Handle UPI payment - ACTUALLY OPEN UPI APP
    if (selectedMethod === 'online') {
        // Real UPI URL that will open the app
        // Use a valid test UPI ID or your actual canteen UPI ID
        const upiUrl = `upi://pay?pa=9999999999@paytm&pn=QuickBite%20Canteen&am=${finalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;
        
        // Method 1: Direct redirect (works on mobile)
        window.location.href = upiUrl;
        
        // Method 2: Create a link and click it (alternative)
        // const link = document.createElement('a');
        // link.href = upiUrl;
        // link.click();
        
        // Redirect to previous orders after 3 seconds (if UPI app doesn't return)
        setTimeout(() => {
            window.location.href = 'previous-orders.html';
        }, 3000);
        
    } else {
        // For counter payment - direct to previous orders
        setTimeout(() => window.location.href = 'previous-orders.html', 2000);
    }
}