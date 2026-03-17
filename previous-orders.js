// Load previous orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPreviousOrders();
});

// Load all previous orders
function loadPreviousOrders() {
    // Try to get orders from multiple possible storage keys
    let orders = JSON.parse(localStorage.getItem('previousOrders')) || 
                 JSON.parse(localStorage.getItem('allOrders')) || 
                 [];
    
    console.log('Loaded orders:', orders); // For debugging
    displayOrders(orders);
    
    // Set All button as active by default
    updateActiveFilter('All');
}

// Display orders in the list
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
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
    const statusClass = order.status === 'Processing' ? 'processing' : 
                       (order.status === 'Pending' ? 'processing' : 'completed');
    
    const paymentClass = order.method === 'online' ? 'online' : 'counter';
    const paymentIcon = order.method === 'online' ? '📱' : '💵';
    const statusIcon = order.status === 'Processing' || order.status === 'Pending' ? '⏳' : '✅';
    
    // Get the total amount - check multiple possible keys
    const totalAmount = order.amount || order.totalAmount || order.total || 0;
    
    // Create items list HTML
    let itemsList = '';
    if (order.items && order.items.length > 0) {
        // Group items by name
        const itemCounts = {};
        order.items.forEach(item => {
            const itemName = item.name || 'Item';
            if (!itemCounts[itemName]) {
                itemCounts[itemName] = {
                    count: 1,
                    price: item.price || 0
                };
            } else {
                itemCounts[itemName].count++;
            }
        });
        
        // Generate HTML for each item
        Object.entries(itemCounts).forEach(([name, data]) => {
            itemsList += `
                <div class="order-item">
                    <span>${name} x${data.count}</span>
                    <span>₹${(data.price * data.count).toFixed(2)}</span>
                </div>
            `;
        });
    }
    
    // Calculate total with taxes if needed
    const gst = totalAmount * 0.05;
    const serviceTax = 5;
    const finalTotal = totalAmount + gst + serviceTax;
    
    return `
        <div class="order-card ${statusClass}" data-status="${order.status}">
            <div class="order-header">
                <span class="token">#${order.token || 'N/A'}</span>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${order.status || 'Pending'}
                    </span>
                    <span class="payment-method ${paymentClass}">
                        ${paymentIcon} ${order.method === 'online' ? 'UPI' : 'Counter'}
                    </span>
                </div>
            </div>
            
            <div class="order-items">
                ${itemsList || '<div class="order-item">No items</div>'}
            </div>
            
            <div class="order-footer">
                <div class="time">
                    <i class="far fa-clock"></i> ${order.time || order.paymentTime || ''}
                </div>
                <span class="total">₹${finalTotal.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Filter orders by status
function filterOrders(status) {
    const orders = JSON.parse(localStorage.getItem('previousOrders')) || 
                   JSON.parse(localStorage.getItem('allOrders')) || 
                   [];
    
    updateActiveFilter(status);
    
    if (status === 'All') {
        // Show ALL orders (both Processing and Completed)
        displayOrders(orders);
    } else {
        // Show only orders matching the selected status
        const filteredOrders = orders.filter(order => 
            order.status && order.status.toLowerCase() === status.toLowerCase()
        );
        displayOrders(filteredOrders);
    }
}

// Update active filter button
function updateActiveFilter(activeStatus) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.trim() === activeStatus) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Make functions globally available
window.loadPreviousOrders = loadPreviousOrders;
window.filterOrders = filterOrders;