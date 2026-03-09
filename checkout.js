// Payment method selection
let selectedMethod = null;
let cartItems = [];
let orderTotal = 0;
let subtotal = 0;

// Backend URL
const BACKEND_URL = 'https://quickbite-backend-z57f.onrender.com';

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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Check if it's Android
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        // Format UPI details
        const upiId = 'canteen@vp.college';
        const payeeName = 'QuickBite';
        const note = `Order ${orderId}`;
        
        // Method 1: Standard UPI URL
        const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
        
        // Method 2: Intent URL for Android
        const intentUrl = `intent://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}#Intent;scheme=upi;package=;end;`;
        
        // App-specific intents
        const gpayUrl = `tez://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&tn=${note}`;
        const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${amount}`;
        const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${amount}`;
        const bharatpeUrl = `bharatpe://pay?pa=${upiId}&pn=${payeeName}&am=${amount}`;
        
        // Show UPI options
        const successMsg = document.getElementById('success-message');
        successMsg.innerHTML = `
            <i class="fas fa-external-link-alt"></i> Choose UPI App:<br><br>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                <button onclick="window.location.href='${gpayUrl}'" 
                    style="background: #3cba54; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fab fa-google"></i> Google Pay
                </button>
                <button onclick="window.location.href='${phonepeUrl}'" 
                    style="background: #5f259f; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-mobile-alt"></i> PhonePe
                </button>
                <button onclick="window.location.href='${paytmUrl}'" 
                    style="background: #00baf2; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-wallet"></i> Paytm
                </button>
                <button onclick="window.location.href='${bharatpeUrl}'" 
                    style="background: #e91e63; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-peace"></i> BharatPe
                </button>
            </div>
            <div style="margin-top: 10px; font-size: 14px; color: #666;">
                <p>If no app opens, please pay manually:</p>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px;">
                    <strong>UPI ID:</strong> ${upiId}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Note:</strong> ${note}
                </div>
            </div>
        `;
        successMsg.classList.add('show');
        
        // For Android, try intent URL
        if (isAndroid) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = intentUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        } else {
            window.location.href = upiUrl;
        }
        
    } else {
        alert(`UPI ID: canteen@vp.college\nAmount: ₹${amount}\nOrder: ${orderId}`);
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
    
    // Get student name from localStorage
    const studentName = localStorage.getItem('studentName') || 'Student';
    
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
        orderId: orderId,
        customerName: studentName
    };
    
    // Show loading state
    const confirmBtn = document.getElementById('main-btn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    confirmBtn.disabled = true;
    
    // Save order to backend
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
            // Show message that order is saved
            const successMsg = document.getElementById('success-message');
            successMsg.innerHTML = `
                <i class="fas fa-check-circle"></i> Order Saved!<br>
                <small>Token #${token} | Amount: ₹${finalAmount.toFixed(2)}</small>
                <br>
                <small style="color: #d63031;">Complete payment in UPI app</small>
            `;
            successMsg.classList.add('show');
            
            // Open UPI apps
            openUPIApps(finalAmount.toFixed(2), orderId);
            
            // Ask if payment completed
            setTimeout(() => {
                if (confirm('Payment completed? Click OK to view your order.')) {
                    showSuccessMessage(orderData);
                }
            }, 8000);
        } else {
            // Counter payment - direct success
            showSuccessMessage(orderData);
        }
    })
    .catch(error => {
        console.error('Error placing order:', error);
        
        // Save locally as backup
        saveOrder(orderData);
        
        // Show message that order saved locally
        const successMsg = document.getElementById('success-message');
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i> Order Saved Locally!<br>
            <small>Token #${token} | Total: ₹${finalAmount.toFixed(2)}</small>
            <br>
            <small style="color: #f39c12;">Server offline - order saved on device</small>
        `;
        successMsg.classList.add('show');
        
        // Still proceed with UPI if online payment selected
        if (selectedMethod === 'online') {
            openUPIApps(finalAmount.toFixed(2), orderId);
            
            setTimeout(() => {
                if (confirm('Payment completed? Click OK to view your order.')) {
                    showSuccessMessage(orderData);
                }
            }, 8000);
        } else {
            showSuccessMessage(orderData);
        }
        
        // Restore button after error
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
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
    
    // Clear cart from localStorage
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