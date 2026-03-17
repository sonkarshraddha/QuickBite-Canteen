document.addEventListener('DOMContentLoaded', function() {
    loadPreviousOrders();
});

function loadPreviousOrders() {
    let orders = JSON.parse(localStorage.getItem('previousOrders')) || 
                 JSON.parse(localStorage.getItem('allOrders')) || 
                 [];
    
    console.log('Loaded orders:', orders);
    displayOrders(orders);
    updateFilterButtons('all');
}

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
    
    orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    ordersList.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order) {
    const orderStatus = order.status || 'Processing';
    
    let statusClass = '';
    let statusIcon = '';
    
    if (orderStatus === 'Processing') {
        statusClass = 'processing';
        statusIcon = '⏳';
    } else if (orderStatus === 'Ready') {
        statusClass = 'ready';
        statusIcon = '🔵';
    } else if (orderStatus === 'Completed') {
        statusClass = 'completed';
        statusIcon = '✅';
    } else {
        statusClass = 'processing';
        statusIcon = '⏳';
    }
    
    const paymentClass = order.method === 'online' ? 'online' : 'counter';
    const paymentIcon = order.method === 'online' ? '📱' : '💵';
    const totalAmount = order.amount || 0;
    
    console.log('Creating card for order:', order);
    
    let itemsList = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsList += `
                <div class="order-item">
                    <span>${item.name} x${item.quantity || 1}</span>
                    <span>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            `;
        });
    }
    
    // FIXED: Check for dine-in order
    const isDineIn = order.orderType === 'dinein' && order.tableNumber !== null && order.tableNumber !== undefined;
    
    let identifierHtml = '';
    
    if (isDineIn) {
        // DINE-IN: Show table number with token below
        identifierHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <span class="table-identifier ${statusClass}">
                    <i class="fas fa-chair"></i> Table ${order.tableNumber}
                </span>
                <span class="token-identifier ${statusClass}" style="font-size: 0.85rem;">
                    <i class="fas fa-ticket-alt"></i> ${order.token}
                </span>
            </div>
        `;
    } else {
        // TAKEAWAY: Show only token
        identifierHtml = `
            <span class="token-identifier ${statusClass}">
                <i class="fas fa-ticket-alt"></i> ${order.token || 'TK-N/A'}
            </span>
        `;
    }
    
    return `
        <div class="order-card ${statusClass}">
            <div class="order-header">
                ${identifierHtml}
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${orderStatus}
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
                <div>
                    <span class="time">
                        <i class="far fa-clock"></i> ${order.time || ''}
                    </span>
                </div>
                <span class="total">₹${totalAmount.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function filterOrders(status) {
    const orders = JSON.parse(localStorage.getItem('previousOrders')) || 
                   JSON.parse(localStorage.getItem('allOrders')) || 
                   [];
    
    updateFilterButtons(status);
    
    if (status === 'all') {
        displayOrders(orders);
    } else {
        const filteredOrders = orders.filter(order => {
            const orderStatus = order.status || 'Processing';
            if (status === 'Processing') {
                return orderStatus === 'Processing' || orderStatus === 'Ready';
            } else if (status === 'Completed') {
                return orderStatus === 'Completed';
            }
            return false;
        });
        displayOrders(filteredOrders);
    }
}

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

function clearAllOrders() {
    if (confirm('Clear all order history?')) {
        localStorage.removeItem('previousOrders');
        localStorage.removeItem('allOrders');
        loadPreviousOrders();
    }
}

window.loadPreviousOrders = loadPreviousOrders;
window.filterOrders = filterOrders;
window.clearAllOrders = clearAllOrders;