// Backend URL
const BASE_URL = 'https://quickbite-backend-z57f.onrender.com';

let allOrders = [];
let currentFilter = 'all';
let currentMenuSection = 'live-orders';

// Check admin access on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
});

function checkAccess() {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        loadData();
        startAutoRefresh();
    } else {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('admin-content').style.display = 'none';
    }
}

function checkPassword() {
    const password = document.getElementById('password-input').value;
    if (password === 'admin123') { // You can change this password
        sessionStorage.setItem('adminAuth', 'true');
        checkAccess();
    } else {
        alert('Incorrect password!');
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    location.reload();
}

function startAutoRefresh() {
    // Refresh every 10 seconds
    setInterval(loadData, 10000);
}

// Load all orders from backend
async function loadData() {
    try {
        const response = await fetch(`${BASE_URL}/get-orders`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        allOrders = await response.json();
        console.log('Orders loaded from server:', allOrders);
        
        updateStats();
        displayOrders();
        displayPaymentHistory();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        // Fallback to localStorage if server fails
        loadLocalData();
    }
}

// Fallback to localStorage if server is down
function loadLocalData() {
    const localOrders = JSON.parse(localStorage.getItem('allOrders')) || 
                        JSON.parse(localStorage.getItem('previousOrders')) || 
                        [];
    
    if (localOrders.length > 0) {
        allOrders = localOrders;
        console.log('Using local orders as fallback:', allOrders);
        updateStats();
        displayOrders();
        displayPaymentHistory();
    } else {
        showEmptyState();
    }
}

function showEmptyState() {
    document.getElementById('active-orders').innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <i class="fas fa-receipt" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
                <p style="color: #666; font-size: 16px;">No orders yet</p>
                <p style="color: #999; font-size: 14px;">Orders will appear here when customers place them</p>
            </td>
        </tr>
    `;
    
    document.getElementById('payment-logs').innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
                <i class="fas fa-credit-card" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
                <p style="color: #666; font-size: 16px;">No payment history</p>
            </td>
        </tr>
    `;
}

function updateStats() {
    const processingOrders = allOrders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;
    const readyOrders = allOrders.filter(o => o.status === 'Ready').length;
    const totalOrders = allOrders.length;
    
    // Calculate today's revenue
    const today = new Date().toLocaleDateString();
    const todayOrders = allOrders.filter(o => o.date === today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
    
    document.getElementById('stat-count').textContent = processingOrders;
    document.getElementById('ready-count').textContent = readyOrders;
    document.getElementById('stat-revenue').textContent = `₹${todayRevenue.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
}

function displayOrders() {
    const tbody = document.getElementById('active-orders');
    tbody.innerHTML = '';
    
    // Filter orders based on current filter
    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(o => o.status === currentFilter);
    }
    
    // Show only non-completed orders by default, or all if filter is active
    if (currentFilter === 'all') {
        filteredOrders = filteredOrders.filter(o => o.status !== 'Completed');
    }
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-check-circle" style="font-size: 36px; color: #27ae60; margin-bottom: 10px; display: block;"></i>
                    <p style="color: #666;">No ${currentFilter === 'all' ? 'active' : currentFilter} orders</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredOrders.forEach((order, index) => {
        // Format items for display
        const itemsText = order.items && order.items.length > 0
            ? order.items.map(item => `${item.name || 'Item'} x${item.quantity || 1}`).join(', ')
            : 'No items';
        
        // Determine status class
        const statusClass = order.status === 'Ready' ? 'status-ready' : 
                           (order.status === 'Completed' ? 'status-completed' : 'status-processing');
        
        // Payment method display
        const methodClass = order.method === 'online' ? 'method-upi' : 'method-cash';
        const methodText = order.method === 'online' ? '📱 UPI' : '💵 Cash';
        
        tbody.innerHTML += `
            <tr class="order-row ${order.status === 'Ready' ? 'ready-row' : ''}">
                <td><span class="token-badge">#${order.token || order.tableNumber || index + 1}</span></td>
                <td class="items-cell" title="${itemsText}">${itemsText.substring(0, 30)}${itemsText.length > 30 ? '...' : ''}</td>
                <td><span class="amount">₹${(parseFloat(order.amount) || 0).toFixed(2)}</span></td>
                <td><span class="time"><i class="far fa-clock"></i> ${order.time || ''}</span></td>
                <td><span class="payment-badge ${methodClass}">${methodText}</span></td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${order.status === 'Ready' ? '✅ Ready' : 
                          order.status === 'Completed' ? '✓ Completed' : '⏳ Processing'}
                    </span>
                </td>
                <td class="action-buttons">
                    ${order.status !== 'Completed' ? `
                        <button class="action-btn ready-btn" onclick="markAsReady('${order._id || index}')" 
                                ${order.status === 'Ready' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> Ready
                        </button>
                        <button class="action-btn complete-btn" onclick="markAsCompleted('${order._id || index}')">
                            <i class="fas fa-check-double"></i> Complete
                        </button>
                    ` : `
                        <span class="completed-label">✓ Done</span>
                    `}
                </td>
            </tr>
        `;
    });
}

function displayPaymentHistory() {
    const tbody = document.getElementById('payment-logs');
    tbody.innerHTML = '';
    
    // Show all orders in payment history (including completed)
    const completedOrders = allOrders.filter(o => o.status === 'Completed');
    
    if (completedOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-receipt" style="font-size: 36px; color: #ccc; margin-bottom: 10px; display: block;"></i>
                    <p style="color: #666;">No completed orders yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    completedOrders.forEach(order => {
        const itemsText = order.items && order.items.length > 0
            ? order.items.map(item => `${item.name || 'Item'}`).join(', ')
            : 'No items';
        
        const methodClass = order.method === 'online' ? 'method-upi' : 'method-cash';
        const methodText = order.method === 'online' ? '📱 UPI' : '💵 Cash';
        
        tbody.innerHTML += `
            <tr>
                <td><span class="token-badge">#${order.token || order.tableNumber || 'N/A'}</span></td>
                <td class="items-cell" title="${itemsText}">${itemsText.substring(0, 25)}${itemsText.length > 25 ? '...' : ''}</td>
                <td><span class="amount">₹${(parseFloat(order.amount) || 0).toFixed(2)}</span></td>
                <td><span class="payment-badge ${methodClass}">${methodText}</span></td>
                <td><span class="time"><i class="far fa-clock"></i> ${order.time || ''}</span></td>
                <td><span class="status-badge status-completed">✓ Completed</span></td>
            </tr>
        `;
    });
}

// Filter orders by status
function filterOrders(status) {
    currentFilter = status;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayOrders();
}

// Mark order as ready
async function markAsReady(orderId) {
    // For now, just update locally
    updateOrderStatus(orderId, 'Ready');
    
    // TODO: Add API call to update on server
    // await fetch(`${BASE_URL}/update-order/${orderId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ status: 'Ready' })
    // });
}

// Mark order as completed
async function markAsCompleted(orderId) {
    updateOrderStatus(orderId, 'Completed');
}

function updateOrderStatus(orderId, newStatus) {
    // Find and update the order
    const orderIndex = allOrders.findIndex(o => o._id === orderId || o.orderId === orderId);
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus;
        
        // Update localStorage
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        localStorage.setItem('previousOrders', JSON.stringify(allOrders));
        
        // Refresh displays
        updateStats();
        displayOrders();
        displayPaymentHistory();
    }
}

// Reset day's orders
function resetDay() {
    if (confirm('Are you sure you want to reset all orders? This cannot be undone.')) {
        allOrders = [];
        localStorage.removeItem('allOrders');
        localStorage.removeItem('previousOrders');
        updateStats();
        displayOrders();
        displayPaymentHistory();
    }
}

// Navigation functions
function showDashboard() {
    document.getElementById('live-orders-section').style.display = 'block';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
}

function showMenuManagement() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'block';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showMenuManagement()"]').classList.add('active');
}

function showTableManagement() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'block';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showTableManagement()"]').classList.add('active');
}

function showDailyAnalytics() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-chart-bar"></i> Daily Report';
    document.getElementById('current-date-range').textContent = 'Today';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showDailyAnalytics()"]').classList.add('active');
}

function showWeeklyAnalytics() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-chart-bar"></i> Weekly Report';
    document.getElementById('current-date-range').textContent = 'This Week';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showWeeklyAnalytics()"]').classList.add('active');
}

function showMonthlyAnalytics() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-chart-bar"></i> Monthly Report';
    document.getElementById('current-date-range').textContent = 'This Month';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showMonthlyAnalytics()"]').classList.add('active');
}

function showRegularUsers() {
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'block';
    
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.menu-item[onclick="showRegularUsers()"]').classList.add('active');
}

function goToDashboard() {
    showDashboard();
}

function toggleSidebar() {
    document.getElementById('admin-sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

// Make functions globally available
window.checkPassword = checkPassword;
window.handleKeyPress = handleKeyPress;
window.logout = logout;
window.filterOrders = filterOrders;
window.markAsReady = markAsReady;
window.markAsCompleted = markAsCompleted;
window.resetDay = resetDay;
window.showDashboard = showDashboard;
window.showMenuManagement = showMenuManagement;
window.showTableManagement = showTableManagement;
window.showDailyAnalytics = showDailyAnalytics;
window.showWeeklyAnalytics = showWeeklyAnalytics;
window.showMonthlyAnalytics = showMonthlyAnalytics;
window.showRegularUsers = showRegularUsers;
window.goToDashboard = goToDashboard;
window.toggleSidebar = toggleSidebar;