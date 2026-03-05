// Load previous orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPreviousOrders();
});

// Load all previous orders
function loadPreviousOrders() {
    const orders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    displayOrders(orders);
    updateFilterButtons('all');
}

// Display orders in the list
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No orders yet!</h3>
                <p>Your order history will appear here</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersList.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// Create HTML for a single order card
function createOrderCard(order) {
    const statusClass = order.status === 'Processing' ? 'processing' : 'completed';
    const paymentClass = order.method === 'online' ? 'online' : 'counter';
    const paymentIcon = order.method === 'online' ? '📱' : '💵';
    const statusIcon = order.status === 'Processing' ? '⏳' : '✅';
    
    const itemsList = order.items.map(item => 
        `<div class="order-item">
            <span>${item.name} x${item.quantity || 1}</span>
            <span>₹${item.price * (item.quantity || 1)}</span>
        </div>`
    ).join('');
    
    return `
        <div class="order-card ${statusClass}" data-status="${order.status}">
            <div class="order-header">
                <span class="token">#${order.token}</span>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${order.status}
                    </span>
                    <span class="payment-method ${paymentClass}">
                        ${paymentIcon} ${order.method === 'online' ? 'UPI' : 'Counter'}
                    </span>
                </div>
            </div>
            
            <div class="order-items">
                ${itemsList}
            </div>
            
            <div class="order-footer">
                <div>
                    <span class="time">
                        <i class="far fa-clock"></i> ${order.time || order.paymentTime || ''}
                    </span>
                </div>
                <span class="total">₹${order.amount}</span>
            </div>
        </div>
    `;
}

// Filter orders by status
function filterOrders(status) {
    const orders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    updateFilterButtons(status);
    
    if (status === 'all') {
        displayOrders(orders);
    } else {
        const filteredOrders = orders.filter(order => order.status === status);
        displayOrders(filteredOrders);
    }
}

// Update active filter button
function updateFilterButtons(activeStatus) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const btnStatus = btn.textContent.toLowerCase();
        if (btnStatus === activeStatus.toLowerCase() || 
            (activeStatus === 'all' && btnStatus === 'all')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Add a test order for demonstration (remove in production)
function addTestOrder() {
    const testOrder = {
        token: 'TK' + Math.floor(Math.random() * 1000),
        items: [
            { name: 'Veg Sandwich', price: 35, quantity: 2 },
            { name: 'Cold Coffee', price: 40, quantity: 1 }
        ],
        amount: 110,
        method: 'online',
        status: 'Processing',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        orderId: 'ORD' + Date.now()
    };
    
    let orders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    orders.push(testOrder);
    localStorage.setItem('previousOrders', JSON.stringify(orders));
    loadPreviousOrders();
}

// Uncomment below line to add test order (for testing only)
// document.addEventListener('DOMContentLoaded', addTestOrder);