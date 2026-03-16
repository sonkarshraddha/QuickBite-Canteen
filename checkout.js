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
    
    // Save to localStorage
    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('allOrders', JSON.stringify(orders));
    localStorage.setItem('previousOrders', JSON.stringify(orders));
    
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
    
    // 🚀 FIXED UPI SECTION - Now with demo mode
    if (selectedMethod === 'online') {
        try {
            // For demo/development - Show alert instead of crashing
            if (confirm(`🔵 DEMO MODE\n\nIn production, this would open your UPI app.\n\nWould you like to simulate a successful payment?`)) {
                // Option 1: Demo mode - just show success
                setTimeout(() => window.location.href = 'success.html', 2000);
            } else {
                // Option 2: Try to open UPI but with a fallback
                const upiUrl = `upi://pay?pa=quickbite@okhdfcbank&pn=QuickBite Canteen&am=${finalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;
                
                // Create invisible iframe to attempt opening UPI
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = upiUrl;
                document.body.appendChild(iframe);
                
                // Fallback if UPI doesn't open
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    if (!document.hidden) { // If still on same page
                        alert('⚠️ UPI app did not open.\n\nRedirecting to success page (Demo Mode)');
                        window.location.href = 'success.html';
                    }
                }, 2000);
            }
        } catch (error) {
            console.log('UPI Error:', error);
            alert('⚠️ UPI payment simulation. Continuing in demo mode...');
            setTimeout(() => window.location.href = 'success.html', 2000);
        }
    } else {
        // For counter payment - direct to success
        setTimeout(() => window.location.href = 'success.html', 3000);
    }
}this