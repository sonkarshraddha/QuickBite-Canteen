// --- 1. ACCESS CONTROL ---
function checkPassword() {
    const password = document.getElementById('password-input').value;
    if (password === "admin123") {
        sessionStorage.setItem('adminAuth', 'true');
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        loadData();
        showNotification("✅ Login successful!", "#27ae60");
    } else {
        alert("❌ Incorrect password!");
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
}

function checkAccess() {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        loadData();
    } else {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('admin-content').style.display = 'none';
    }
}

// --- 2. DATA HANDLING from localStorage ---
let currentFilter = 'all';

function loadData() {
    // Get orders from allOrders (single source of truth)
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    
    // Also update previousOrders to keep them in sync
    syncPreviousOrders(orders);
    
    displayOrders(orders);
    updateStats(orders);
}

// Sync allOrders with previousOrders
function syncPreviousOrders(orders) {
    localStorage.setItem('previousOrders', JSON.stringify(orders));
}

function displayOrders(orders) {
    const activeTable = document.getElementById('active-orders');
    const paymentTable = document.getElementById('payment-logs');
    
    activeTable.innerHTML = "";
    paymentTable.innerHTML = "";

    if (orders.length === 0) {
        activeTable.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-coffee"></i><br>No orders yet</td></tr>`;
        paymentTable.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-credit-card"></i><br>No payment history</td></tr>`;
        return;
    }

    // Filter orders based on current filter
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === currentFilter);
    }

    // Display filtered orders in kitchen table
    filteredOrders.forEach((order, index) => {
        const itemsText = formatItems(order.items);
        const orderTime = order.time || order.paymentTime || new Date().toLocaleTimeString();
        const statusClass = getStatusClass(order.status);
        
        // ✅ FIX: Get the correct amount - check multiple possible keys
        const amount = getOrderAmount(order);
        
        activeTable.innerHTML += `
            <tr>
                <td><span class="token-badge">#${order.token || 'TK' + (index+1)}</span></td>
                <td>${itemsText}</td>
                <td><b>₹${amount}</b></td>
                <td>${orderTime}</td>
                <td><span class="method-tag ${order.method === 'online' ? 'upi' : 'cash'}">
                    ${order.method === 'online' ? '📱 UPI' : '💵 CASH'}
                </span></td>
                <td><span class="status-badge ${statusClass}">${order.status || 'Processing'}</span></td>
                <td class="action-btns">
                    ${getActionButtons(order, index)}
                </td>
            </tr>
        `;
    });

    // Display all orders in payment history
    orders.forEach((order, index) => {
        const itemsText = formatItems(order.items);
        const orderTime = order.time || order.paymentTime || new Date().toLocaleTimeString();
        const statusClass = getStatusClass(order.status);
        
        // ✅ FIX: Get the correct amount - check multiple possible keys
        const amount = getOrderAmount(order);
        
        paymentTable.innerHTML += `
            <tr>
                <td><span class="token-badge">#${order.token || 'TK' + (index+1)}</span></td>
                <td>${itemsText}</td>
                <td><b>₹${amount}</b></td>
                <td><span class="method-tag ${order.method === 'online' ? 'upi' : 'cash'}">
                    ${order.method === 'online' ? '📱 UPI' : '💵 CASH'}
                </span></td>
                <td>${orderTime}</td>
                <td><span class="status-badge ${statusClass}">${order.status || 'Processing'}</span></td>
            </tr>
        `;
    });
}

// ✅ NEW FUNCTION: Get amount from order checking all possible keys
function getOrderAmount(order) {
    // Try all possible keys where amount might be stored
    const possibleAmounts = [
        order.amount,
        order.totalAmount,
        order.total,
        order.finalAmount,
        order.payAmount,
        order.subtotal ? order.subtotal + (order.gst || 0) + (order.serviceTax || 0) : null
    ];
    
    // Find the first valid number
    for (let amount of possibleAmounts) {
        if (amount !== undefined && amount !== null && !isNaN(amount) && parseFloat(amount) > 0) {
            return parseFloat(amount).toFixed(2);
        }
    }
    
    // If no amount found, try to calculate from items
    if (order.items && order.items.length > 0) {
        const calculatedTotal = order.items.reduce((sum, item) => {
            const price = item.price || 0;
            const qty = item.quantity || 1;
            return sum + (price * qty);
        }, 0);
        
        if (calculatedTotal > 0) {
            return calculatedTotal.toFixed(2);
        }
    }
    
    return "0.00";
}

function formatItems(items) {
    if (!items || items.length === 0) return "Order items";
    
    return items.map(item => {
        if (typeof item === 'object') {
            const itemName = item.name || 'Item';
            const quantity = item.quantity || 1;
            return `${itemName} (x${quantity})`;
        }
        return item;
    }).join(", ");
}

function getStatusClass(status) {
    switch(status) {
        case 'Processing': return 'status-processing';
        case 'Ready': return 'status-ready';
        case 'Completed': return 'status-completed';
        default: return 'status-processing';
    }
}

function getActionButtons(order, index) {
    if (order.status === 'Completed') {
        return `<button class="ready-btn" disabled>✓ Completed</button>`;
    } else if (order.status === 'Ready') {
        return `
            <button class="complete-btn" onclick="markCompleted(${index})">
                <i class="fas fa-check-double"></i> Complete
            </button>
        `;
    } else {
        return `
            <button class="ready-btn" onclick="markReady(${index})">
                <i class="fas fa-check"></i> Mark Ready
            </button>
        `;
    }
}

function updateStats(orders) {
    let revenue = 0;
    let processingCount = 0;
    let readyCount = 0;
    
    orders.forEach(order => {
        // ✅ FIX: Use the same amount function for revenue calculation
        const amount = parseFloat(getOrderAmount(order)) || 0;
        revenue += amount;
        
        if (order.status === 'Processing') {
            processingCount++;
        } else if (order.status === 'Ready') {
            readyCount++;
        }
    });

    document.getElementById('stat-count').innerText = processingCount;
    document.getElementById('ready-count').innerText = readyCount;
    document.getElementById('stat-revenue').innerText = "₹" + revenue.toFixed(2);
    document.getElementById('total-orders').innerText = orders.length;
}

function markReady(index) {
    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    
    if (orders[index]) {
        // Update status to Ready
        orders[index].status = 'Ready';
        orders[index].readyTime = new Date().toLocaleTimeString();
        orders[index].readyDate = new Date().toLocaleDateString();
        
        // Save back to localStorage
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Sync with previousOrders
        localStorage.setItem('previousOrders', JSON.stringify(orders));
        
        // Refresh display
        loadData();
        
        // Show notification
        const amount = getOrderAmount(orders[index]);
        showNotification(`✅ Order #${orders[index].token} (₹${amount}) is ready for pickup!`, "#3498db");
    }
}

function markCompleted(index) {
    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    
    if (orders[index]) {
        // Update status to Completed
        orders[index].status = 'Completed';
        orders[index].completedTime = new Date().toLocaleTimeString();
        orders[index].completedDate = new Date().toLocaleDateString();
        
        // Save back to localStorage
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Sync with previousOrders
        localStorage.setItem('previousOrders', JSON.stringify(orders));
        
        // Refresh display
        loadData();
        
        // Show notification
        const amount = getOrderAmount(orders[index]);
        showNotification(`✅ Order #${orders[index].token} (₹${amount}) completed!`, "#27ae60");
    }
}

function filterOrders(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter.toLowerCase()) || 
            (filter === 'all' && btn.textContent.includes('All'))) {
            btn.classList.add('active');
        }
    });
    
    loadData(); // Reload with filter
}

function resetDay() {
    if(confirm("⚠️ Delete all order history for today?")) {
        localStorage.removeItem('allOrders');
        localStorage.removeItem('previousOrders');
        loadData();
        showNotification("✅ All orders cleared!", "#27ae60");
    }
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    document.getElementById('password-input').value = '';
    showNotification("👋 Logged out successfully!", "#636e72");
}

function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    setInterval(loadData, 2000); // Refresh every 2 seconds
});