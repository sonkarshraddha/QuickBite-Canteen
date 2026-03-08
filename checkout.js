// Payment method selection
let selectedMethod = null;
let cartItems = [];
let orderTotal = 0;
let subtotal = 0;

// Backend URL - Add this at the top
const BACKEND_URL = 'https://quickbite-backend-z577.onrender.com';

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

// Display order summary
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
    
    // Add tax breakdown
    const gst = subtotal * 0.05;
    const serviceTax = 5;
    const finalTotal = subtotal + gst + serviceTax;
    
    // Update orderTotal to include taxes
    orderTotal = finalTotal;
    
    itemsList.innerHTML += `
        <div class="order-item" style="color: #666; border-top: 1px dashed #ddd; margin-top: 10px; padding-top: 10px;">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="order-item" style="color: #666;">
            <span>GST (5%):</span>
            <span>₹${gst.toFixed(2)}</span>
        </div>
        <div class="order-item" style="color: #666;">
            <span>Service Tax:</span>
            <span>₹${serviceTax.toFixed(2)}</span>
        </div>
    `;
    
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

// Function to open UPI apps on mobile
function openUPIApps(amount, orderId) {
    // UPI Intent URL for Android
    const upiIntent = `upi://pay?pa=canteen@vp.college&pn=QuickBite%20Canteen&am=${amount}&cu=INR&tn=Order%20${orderId}`;
    
    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try to open UPI apps
        window.location.href = upiIntent;
        
        // Show UPI options
        const upiOptions = document.getElementById('success-message');
        upiOptions.innerHTML = `
            <i class="fas fa-external-link-alt"></i> Choose UPI App:<br><br>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.href='tez://pay?pa=canteen@vp.college&pn=QuickBite&am=${amount}&tn=Order%20${orderId}'" 
                    style="background: #3cba54; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fab fa-google"></i> GPay
                </button>
                <button onclick="window.location.href='phonepe://pay?pa=canteen@vp.college&pn=QuickBite&am=${amount}'" 
                    style="background: #5f259f; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-mobile-alt"></i> PhonePe
                </button>
                <button onclick="window.location.href='paytmmp://pay?pa=canteen@vp.college&pn=QuickBite&am=${amount}'" 
                    style="background: #00baf2; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-wallet"></i> Paytm
                </button>
            </div>
            <br>
            <small>Select any UPI app to complete payment</small>
        `;
        upiOptions.classList.add('show');
    } else {
        // On desktop, show QR code or message
        alert(`Please scan this QR code with your UPI app to pay ₹${amount}\n\nUPI ID: canteen@vp.college`);
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
    
    // Calculate taxes
    const gst = subtotal * 0.05;
    const serviceTax = 5;
    const finalAmount = subtotal + gst + serviceTax;
    
    // Generate unique order ID
    const orderId = 'ORD' + Date.now();
    
    // Create order object
    const orderData = {
        token: token,
        items: cartItems.map(item => ({
            name: item.name || 'Item',
            price: parseFloat(item.price) || 0,
            quantity: 1
        })),
        subtotal: subtotal,
        gst: gst,
        serviceTax: serviceTax,
        amount: finalAmount,
        method: selectedMethod,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Processing',
        orderId: orderId
    };
    
    // Save order to backend - THIS IS WHERE THE FETCH GOES
    fetch(`${BACKEND_URL}/place-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to place order');
        }
        return response.json();
    })
    .then(data => {
        console.log('Order saved to backend:', data);
        
        // Also save to localStorage as backup
        saveOrder(orderData);
        
        // Handle payment based on method
        if (selectedMethod === 'online') {
            // Open UPI apps
            openUPIApps(finalAmount.toFixed(2), orderId);
            
            // Show success message after payment (simulated)
            setTimeout(() => {
                showSuccessMessage(orderData);
            }, 5000);
        } else {
            // Counter payment - direct success
            showSuccessMessage(orderData);
        }
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to connect to server. Order saved locally.');
        
        // Save locally as backup
        saveOrder(orderData);
        
        // Still proceed with payment
        if (selectedMethod === 'online') {
            openUPIApps(finalAmount.toFixed(2), orderId);
            setTimeout(() => {
                showSuccessMessage(orderData);
            }, 5000);
        } else {
            showSuccessMessage(orderData);
        }
    });
}

// Save order to localStorage (backup)
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
    
    console.log('Order saved locally:', order);
}

// Show success message and redirect
function showSuccessMessage(order) {
    const successMsg = document.getElementById('success-message');
    
    if (order.method === 'online') {
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i> Payment Successful!<br>
            <small>Token #${order.token} | Total: ₹${order.amount.toFixed(2)}</small>
        `;
    } else {
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i> Order Confirmed!<br>
            <small>Token #${order.token} | Total: ₹${order.amount.toFixed(2)}<br>Please pay at counter</small>
        `;
    }
    
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
    
    // Redirect to previous orders page after 3 seconds
    setTimeout(() => {
        window.location.href = 'previous-orders.html';
    }, 3000);
}

// Go back to menu
function goBackToMenu() {
    window.location.href = 'menu.html';
}