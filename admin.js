// --- 1. ACCESS CONTROL ---
function checkPassword() {
    const password = document.getElementById('password-input').value;
    if (password === "admin123") {
        sessionStorage.setItem('adminAuth', 'true');
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        loadData();
        loadMenuItems(); // Load menu items
        loadTableData(); // Load table data
        showNotification("✅ Login successful!", "#27ae60");
        initializeAnalytics();
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
        loadMenuItems();
        loadTableData();
        initializeAnalytics();
    } else {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('admin-content').style.display = 'none';
    }
}

// --- 2. SIDEBAR FUNCTIONS ---
function toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function showDashboard() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('span') && item.querySelector('span').textContent === 'Dashboard') {
            item.classList.add('active');
        }
    });
    
    document.getElementById('live-orders-section').style.display = 'block';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    loadData();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
    
    showNotification("📋 Showing live orders", "#3498db");
}

function goToDashboard() {
    showDashboard();
}

function showMenuManagement() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'block';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    loadMenuItems();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showTableManagement() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'block';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('regular-users-section').style.display = 'none';
    
    loadTableData();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showDailyAnalytics() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-calendar-day"></i> Daily Report';
    document.getElementById('current-date-range').innerText = 'Today';
    
    loadDailyAnalytics();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showWeeklyAnalytics() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-calendar-week"></i> Weekly Report';
    document.getElementById('current-date-range').innerText = 'This Week';
    
    loadWeeklyAnalytics();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showMonthlyAnalytics() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'none';
    
    document.getElementById('analytics-title').innerHTML = '<i class="fas fa-calendar-alt"></i> Monthly Report';
    document.getElementById('current-date-range').innerText = 'This Month';
    
    loadMonthlyAnalytics();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showRegularUsers() {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('live-orders-section').style.display = 'none';
    document.getElementById('menu-management-section').style.display = 'none';
    document.getElementById('table-management-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    document.getElementById('regular-users-section').style.display = 'block';
    
    loadRegularUsers();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function showTopCustomers() {
    showRegularUsers();
}

function showSettings() {
    alert('Settings panel coming soon!');
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// --- 3. MENU MANAGEMENT FUNCTIONS ---

// Default menu items
const defaultMenuItems = [
    // Breakfast
    { id: 1, name: 'Veg Sandwich', category: 'breakfast', price: 35, available: true },
    { id: 2, name: 'Veg Maggi', category: 'breakfast', price: 40, available: true },
    { id: 3, name: 'Poha', category: 'breakfast', price: 25, available: true },
    { id: 4, name: 'Upma', category: 'breakfast', price: 25, available: true },
    { id: 5, name: 'Aloo Paratha', category: 'breakfast', price: 45, available: true },
    { id: 6, name: 'Chole Bhature', category: 'breakfast', price: 60, available: true },
    { id: 7, name: 'Samosa', category: 'breakfast', price: 20, available: true },
    { id: 8, name: 'Bread Pakora', category: 'breakfast', price: 25, available: true },
    
    // Main Meals
    { id: 9, name: 'North Indian Thali', category: 'meals', price: 80, available: true },
    { id: 10, name: 'South Indian Thali', category: 'meals', price: 75, available: true },
    { id: 11, name: 'Veg Biryani', category: 'meals', price: 65, available: true },
    { id: 12, name: 'Rajma Chawal', category: 'meals', price: 50, available: true },
    { id: 13, name: 'Kadhi Chawal', category: 'meals', price: 50, available: true },
    { id: 14, name: 'Veg Pulao', category: 'meals', price: 45, available: true },
    
    // Chinese
    { id: 15, name: 'Veg Chowmein', category: 'chinese', price: 50, available: true },
    { id: 16, name: 'Gobi Manchurian', category: 'chinese', price: 60, available: true },
    { id: 17, name: 'Spring Rolls', category: 'chinese', price: 40, available: true },
    { id: 18, name: 'Chilli Potato', category: 'chinese', price: 55, available: true },
    
    // Snacks
    { id: 19, name: 'Vada Pav', category: 'snacks', price: 20, available: true },
    { id: 20, name: 'Pav Bhaji', category: 'snacks', price: 80, available: true },
    { id: 21, name: 'Veg Frankie', category: 'snacks', price: 50, available: true },
    { id: 22, name: 'French Fries', category: 'snacks', price: 45, available: true },
    { id: 23, name: 'Veg Cutlet', category: 'snacks', price: 35, available: true },
    
    // Beverages
    { id: 24, name: 'Masala Chai', category: 'beverages', price: 10, available: true },
    { id: 25, name: 'Filter Coffee', category: 'beverages', price: 15, available: true },
    { id: 26, name: 'Cold Coffee', category: 'beverages', price: 40, available: true },
    { id: 27, name: 'Sweet Lassi', category: 'beverages', price: 35, available: true },
    { id: 28, name: 'Buttermilk', category: 'beverages', price: 25, available: true },
    { id: 29, name: 'Lemon Soda', category: 'beverages', price: 20, available: true },
    { id: 30, name: 'Cold Drink', category: 'beverages', price: 25, available: true },
    { id: 31, name: 'Chocolate Shake', category: 'beverages', price: 50, available: true },
    
    // Late Night Combos
    { id: 32, name: 'Bun Maska Combo', category: 'snacks', price: 30, available: true },
    { id: 33, name: 'Toast Jam Combo', category: 'snacks', price: 25, available: true },
    { id: 34, name: 'Packet Chips', category: 'snacks', price: 10, available: true }
];

let menuItems = [];
let currentMenuCategory = 'all';

function loadMenuItems() {
    // Load from localStorage or use defaults
    const savedMenu = localStorage.getItem('menuItems');
    if (savedMenu) {
        menuItems = JSON.parse(savedMenu);
    } else {
        menuItems = [...defaultMenuItems];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
    
    displayMenuItems();
    updateMenuUnavailableBadge();
}

function displayMenuItems() {
    const grid = document.getElementById('menu-items-grid');
    if (!grid) return;
    
    let filteredItems = menuItems;
    if (currentMenuCategory !== 'all') {
        filteredItems = menuItems.filter(item => item.category === currentMenuCategory);
    }
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '<p class="empty-state">No menu items in this category</p>';
        return;
    }
    
    grid.innerHTML = filteredItems.map(item => `
        <div class="menu-item-card ${!item.available ? 'unavailable' : ''}">
            <div class="menu-item-info">
                <h4>${item.name}</h4>
                <p class="menu-item-price">₹${item.price}</p>
                <span class="menu-item-category">${item.category}</span>
            </div>
            <div class="menu-item-actions">
                <label class="availability-toggle">
                    <input type="checkbox" 
                           ${item.available ? 'checked' : ''} 
                           onchange="toggleMenuItemAvailability(${item.id}, this.checked)">
                    <span class="toggle-slider"></span>
                </label>
                <span class="availability-text">${item.available ? 'Available' : 'Unavailable'}</span>
            </div>
        </div>
    `).join('');
}

function filterMenuCategory(category) {
    currentMenuCategory = category;
    
    document.querySelectorAll('.category-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category) || 
            (category === 'all' && btn.textContent.includes('All'))) {
            btn.classList.add('active');
        }
    });
    
    displayMenuItems();
}

function toggleMenuItemAvailability(itemId, available) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.available = available;
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        displayMenuItems();
        updateMenuUnavailableBadge();
        
        // Sync with menu.js by storing in localStorage for user view
        localStorage.setItem('menuAvailability', JSON.stringify(
            menuItems.map(i => ({ id: i.id, available: i.available }))
        ));
        
        showNotification(`${item.name} is now ${available ? 'available' : 'unavailable'}`, 
                        available ? '#27ae60' : '#e74c3c');
    }
}

function saveMenuAvailability() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('menuAvailability', JSON.stringify(
        menuItems.map(i => ({ id: i.id, available: i.available }))
    ));
    showNotification('✅ Menu availability saved!', '#27ae60');
}

function setAllAvailable(available) {
    menuItems.forEach(item => {
        item.available = available;
    });
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('menuAvailability', JSON.stringify(
        menuItems.map(i => ({ id: i.id, available: i.available }))
    ));
    displayMenuItems();
    updateMenuUnavailableBadge();
    showNotification(`All items set to ${available ? 'available' : 'unavailable'}`, 
                    available ? '#27ae60' : '#e74c3c');
}

function updateMenuUnavailableBadge() {
    const unavailableCount = menuItems.filter(item => !item.available).length;
    const badge = document.getElementById('menu-unavailable-badge');
    if (badge) {
        if (unavailableCount > 0) {
            badge.style.display = 'inline';
            badge.textContent = unavailableCount;
        } else {
            badge.style.display = 'none';
        }
    }
}

// --- 4. TABLE MANAGEMENT FUNCTIONS ---

let tables = [];
let totalTables = 20;

function loadTableData() {
    // Load from localStorage or initialize
    const savedTables = localStorage.getItem('tables');
    const savedTotalTables = localStorage.getItem('totalTables');
    
    if (savedTotalTables) {
        totalTables = parseInt(savedTotalTables);
    }
    
    if (savedTables) {
        tables = JSON.parse(savedTables);
    } else {
        // Initialize tables
        tables = [];
        for (let i = 1; i <= totalTables; i++) {
            tables.push({
                id: i,
                number: i,
                status: 'available', // available, occupied, reserved
                occupiedBy: null,
                orderToken: null,
                occupiedSince: null
            });
        }
        localStorage.setItem('tables', JSON.stringify(tables));
    }
    
    document.getElementById('total-tables').value = totalTables;
    updateTableStats();
    displayTables();
    updateOccupancyDetails();
}

function displayTables() {
    const grid = document.getElementById('tables-grid');
    if (!grid) return;
    
    grid.innerHTML = tables.map(table => `
        <div class="table-card ${table.status}" onclick="showTableActions(${table.id})">
            <div class="table-number">Table ${table.number}</div>
            <div class="table-status ${table.status}">
                ${table.status === 'available' ? '✅ Available' : 
                  table.status === 'occupied' ? '👤 Occupied' : '📅 Reserved'}
            </div>
            ${table.occupiedBy ? `
                <div class="table-details">
                    <small>${table.occupiedBy}</small>
                    ${table.orderToken ? `<br><small>Token: #${table.orderToken}</small>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function showTableActions(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const action = prompt(
        `Table ${table.number}\nCurrent Status: ${table.status}\n\n` +
        `Choose action:\n` +
        `1. Mark as Available\n` +
        `2. Mark as Occupied\n` +
        `3. Mark as Reserved\n` +
        `4. Cancel\n\n` +
        `Enter option number:`,
        '1'
    );
    
    if (action === '1') {
        updateTableStatus(tableId, 'available');
    } else if (action === '2') {
        const customerName = prompt('Enter customer name or token:');
        if (customerName) {
            updateTableStatus(tableId, 'occupied', customerName);
        }
    } else if (action === '3') {
        const reservationName = prompt('Enter reservation name:');
        if (reservationName) {
            updateTableStatus(tableId, 'reserved', reservationName);
        }
    }
}

function updateTableStatus(tableId, status, occupiedBy = null) {
    const table = tables.find(t => t.id === tableId);
    if (table) {
        table.status = status;
        table.occupiedBy = occupiedBy;
        table.occupiedSince = status !== 'available' ? new Date().toLocaleTimeString() : null;
        
        // If occupied, assign a random token (in real app, this would come from order)
        if (status === 'occupied' && !table.orderToken) {
            table.orderToken = 'TK' + Math.floor(100 + Math.random() * 900);
        } else if (status === 'available') {
            table.occupiedBy = null;
            table.orderToken = null;
            table.occupiedSince = null;
        }
        
        localStorage.setItem('tables', JSON.stringify(tables));
        displayTables();
        updateTableStats();
        updateOccupancyDetails();
        
        showNotification(`Table ${table.number} marked as ${status}`, 
                        status === 'available' ? '#27ae60' : '#3498db');
    }
}

function updateTableStats() {
    const availableCount = tables.filter(t => t.status === 'available').length;
    const totalTables = tables.length;
    
    document.getElementById('available-tables-count').textContent = availableCount;
    document.getElementById('total-tables-count').textContent = totalTables;
    
    // Update sidebar badge
    const tableBadge = document.getElementById('table-status-badge');
    if (tableBadge) {
        tableBadge.textContent = `${availableCount} seats`;
        tableBadge.style.background = availableCount > 0 ? '#27ae60' : '#e74c3c';
    }
}

function updateOccupancyDetails() {
    const occupiedTables = tables.filter(t => t.status !== 'available');
    const detailsDiv = document.getElementById('occupancy-details');
    
    if (occupiedTables.length === 0) {
        detailsDiv.innerHTML = '<p>No active table assignments</p>';
        return;
    }
    
    detailsDiv.innerHTML = occupiedTables.map(table => `
        <div class="occupancy-item">
            <strong>Table ${table.number}</strong> - 
            <span class="status-${table.status}">${table.status}</span>
            ${table.occupiedBy ? `<br>Customer: ${table.occupiedBy}` : ''}
            ${table.occupiedSince ? `<br><small>Since: ${table.occupiedSince}</small>` : ''}
        </div>
    `).join('');
}

function updateTotalTables() {
    const newTotal = parseInt(document.getElementById('total-tables').value);
    if (newTotal < 1 || newTotal > 50) {
        alert('Please enter a value between 1 and 50');
        return;
    }
    
    if (newTotal !== totalTables) {
        if (confirm(`Change total tables from ${totalTables} to ${newTotal}?`)) {
            totalTables = newTotal;
            
            // Adjust tables array
            if (newTotal > tables.length) {
                // Add new tables
                for (let i = tables.length + 1; i <= newTotal; i++) {
                    tables.push({
                        id: i,
                        number: i,
                        status: 'available',
                        occupiedBy: null,
                        orderToken: null,
                        occupiedSince: null
                    });
                }
            } else if (newTotal < tables.length) {
                // Remove tables (only if they're available)
                const availableTables = tables.filter(t => t.status === 'available');
                if (availableTables.length < (tables.length - newTotal)) {
                    alert('Cannot reduce table count: Some tables are occupied/reserved');
                    document.getElementById('total-tables').value = totalTables;
                    return;
                }
                tables = tables.slice(0, newTotal);
            }
            
            localStorage.setItem('tables', JSON.stringify(tables));
            localStorage.setItem('totalTables', totalTables);
            displayTables();
            updateTableStats();
            updateOccupancyDetails();
            
            showNotification(`Table count updated to ${totalTables}`, '#27ae60');
        } else {
            document.getElementById('total-tables').value = totalTables;
        }
    }
}

function resetAllTables() {
    if (confirm('Reset all tables to available? This will clear all assignments.')) {
        tables.forEach(table => {
            table.status = 'available';
            table.occupiedBy = null;
            table.orderToken = null;
            table.occupiedSince = null;
        });
        
        localStorage.setItem('tables', JSON.stringify(tables));
        displayTables();
        updateTableStats();
        updateOccupancyDetails();
        
        showNotification('All tables reset to available', '#27ae60');
    }
}

// --- 5. DATA HANDLING from localStorage ---
let currentFilter = 'all';
let chartInstance = null;

function loadData() {
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    syncPreviousOrders(orders);
    displayOrders(orders);
    updateStats(orders);
}

function syncPreviousOrders(orders) {
    localStorage.setItem('previousOrders', JSON.stringify(orders));
}

function displayOrders(orders) {
    const activeTable = document.getElementById('active-orders');
    const paymentTable = document.getElementById('payment-logs');
    
    if (!activeTable || !paymentTable) return;
    
    activeTable.innerHTML = "";
    paymentTable.innerHTML = "";

    if (orders.length === 0) {
        activeTable.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-coffee"></i><br>No orders yet</td></tr>`;
        paymentTable.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-credit-card"></i><br>No payment history</td></tr>`;
        return;
    }

    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === currentFilter);
    }

    filteredOrders.forEach((order, index) => {
        const itemsText = formatItems(order.items);
        const orderTime = order.time || order.paymentTime || new Date().toLocaleTimeString();
        const statusClass = getStatusClass(order.status);
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
                    ${getActionButtons(order, orders.indexOf(order))}
                </td>
            </tr>
        `;
    });

    orders.forEach((order) => {
        const itemsText = formatItems(order.items);
        const orderTime = order.time || order.paymentTime || new Date().toLocaleTimeString();
        const statusClass = getStatusClass(order.status);
        const amount = getOrderAmount(order);
        
        paymentTable.innerHTML += `
            <tr>
                <td><span class="token-badge">#${order.token || 'N/A'}</span></td>
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

function getOrderAmount(order) {
    const possibleAmounts = [
        order.amount,
        order.totalAmount,
        order.total,
        order.finalAmount,
        order.payAmount,
        order.subtotal ? order.subtotal + (order.gst || 0) + (order.serviceTax || 0) : null
    ];
    
    for (let amount of possibleAmounts) {
        if (amount !== undefined && amount !== null && !isNaN(amount) && parseFloat(amount) > 0) {
            return parseFloat(amount).toFixed(2);
        }
    }
    
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
        orders[index].status = 'Ready';
        orders[index].readyTime = new Date().toLocaleTimeString();
        orders[index].readyDate = new Date().toLocaleDateString();
        
        localStorage.setItem('allOrders', JSON.stringify(orders));
        localStorage.setItem('previousOrders', JSON.stringify(orders));
        
        loadData();
        
        const amount = getOrderAmount(orders[index]);
        showNotification(`✅ Order #${orders[index].token} (₹${amount}) is ready for pickup!`, "#3498db");
    }
}

function markCompleted(index) {
    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    
    if (orders[index]) {
        orders[index].status = 'Completed';
        orders[index].completedTime = new Date().toLocaleTimeString();
        orders[index].completedDate = new Date().toLocaleDateString();
        
        localStorage.setItem('allOrders', JSON.stringify(orders));
        localStorage.setItem('previousOrders', JSON.stringify(orders));
        
        loadData();
        
        const amount = getOrderAmount(orders[index]);
        showNotification(`✅ Order #${orders[index].token} (₹${amount}) completed!`, "#27ae60");
    }
}

function filterOrders(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter.toLowerCase()) || 
            (filter === 'all' && btn.textContent.includes('All'))) {
            btn.classList.add('active');
        }
    });
    
    loadData();
}

function resetDay() {
    if(confirm("⚠️ Delete all order history for today?")) {
        localStorage.removeItem('allOrders');
        localStorage.removeItem('previousOrders');
        loadData();
        if (chartInstance) {
            chartInstance.destroy();
        }
        showNotification("✅ All orders cleared!", "#27ae60");
    }
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    window.location.href = 'index.html'; // Change from previous.html to index.html
}

// --- 6. ANALYTICS FUNCTIONS ---
function initializeAnalytics() {
    loadDailyAnalytics();
}

let currentDate = new Date();

function changeDate(direction) {
    if (document.getElementById('analytics-title').innerHTML.includes('Daily')) {
        currentDate.setDate(currentDate.getDate() + direction);
        document.getElementById('current-date-range').innerText = currentDate.toLocaleDateString();
        loadDailyAnalytics();
    } else if (document.getElementById('analytics-title').innerHTML.includes('Weekly')) {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
        document.getElementById('current-date-range').innerText = `Week of ${currentDate.toLocaleDateString()}`;
        loadWeeklyAnalytics();
    } else if (document.getElementById('analytics-title').innerHTML.includes('Monthly')) {
        currentDate.setMonth(currentDate.getMonth() + direction);
        document.getElementById('current-date-range').innerText = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        loadMonthlyAnalytics();
    }
}

function loadDailyAnalytics() {
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const today = new Date().toLocaleDateString();
    
    const todayOrders = orders.filter(order => order.date === today);
    
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(getOrderAmount(order)), 0);
    const uniqueTokens = new Set(todayOrders.map(order => order.token)).size;
    const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    document.getElementById('analytics-total-orders').innerText = totalOrders;
    document.getElementById('analytics-total-revenue').innerText = '₹' + totalRevenue.toFixed(2);
    document.getElementById('analytics-unique-customers').innerText = uniqueTokens;
    document.getElementById('analytics-avg-order').innerText = '₹' + avgOrder.toFixed(2);
    
    const hourlyData = new Array(9).fill(0);
    
    todayOrders.forEach(order => {
        const timeStr = order.time || order.paymentTime || '';
        const hour = parseInt(timeStr.split(':')[0]);
        if (hour >= 9 && hour <= 18) {
            const index = hour - 9;
            hourlyData[index] += parseFloat(getOrderAmount(order));
        }
    });
    
    createAnalyticsChart(
        ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
        hourlyData,
        'Hourly Revenue (₹)',
        '#d63031'
    );
}

function loadWeeklyAnalytics() {
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= weekAgo && orderDate <= today;
    });
    
    const totalOrders = weekOrders.length;
    const totalRevenue = weekOrders.reduce((sum, order) => sum + parseFloat(getOrderAmount(order)), 0);
    const uniqueTokens = new Set(weekOrders.map(order => order.token)).size;
    const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    document.getElementById('analytics-total-orders').innerText = totalOrders;
    document.getElementById('analytics-total-revenue').innerText = '₹' + totalRevenue.toFixed(2);
    document.getElementById('analytics-unique-customers').innerText = uniqueTokens;
    document.getElementById('analytics-avg-order').innerText = '₹' + avgOrder.toFixed(2);
    
    const dailyData = new Array(7).fill(0);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    weekOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const dayIndex = orderDate.getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        dailyData[adjustedIndex] += parseFloat(getOrderAmount(order));
    });
    
    createAnalyticsChart(days, dailyData, 'Daily Revenue (₹)', '#f39c12');
}

function loadMonthlyAnalytics() {
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const monthlyTarget = 50000;
    const totalRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(getOrderAmount(order)), 0);
    
    document.getElementById('analytics-total-orders').innerText = monthOrders.length;
    document.getElementById('analytics-total-revenue').innerText = '₹' + totalRevenue.toFixed(2);
    document.getElementById('analytics-unique-customers').innerText = new Set(monthOrders.map(order => order.token)).size;
    document.getElementById('analytics-avg-order').innerText = '₹' + (monthOrders.length > 0 ? (totalRevenue / monthOrders.length).toFixed(2) : '0');
    
    const weeklyData = [0, 0, 0, 0];
    monthOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const weekOfMonth = Math.floor((orderDate.getDate() - 1) / 7);
        if (weekOfMonth < 4) {
            weeklyData[weekOfMonth] += parseFloat(getOrderAmount(order));
        }
    });
    
    const weeklyTarget = monthlyTarget / 4;
    const targetData = weeklyData.map(() => weeklyTarget);
    
    createMonthlyChart(
        ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        weeklyData,
        targetData,
        'Weekly Progress vs Target (₹)'
    );
}

function createAnalyticsChart(labels, data, label, color) {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color + '80',
                borderColor: color,
                borderWidth: 2,
                borderRadius: 5,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function createMonthlyChart(labels, data, targetData, label) {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual Revenue',
                    data: data,
                    backgroundColor: '#d63031',
                    borderColor: '#c0392b',
                    borderWidth: 2,
                    borderRadius: 5
                },
                {
                    label: 'Target',
                    data: targetData,
                    type: 'line',
                    borderColor: '#27ae60',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function loadRegularUsers() {
    const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const usersList = document.getElementById('regular-users-list');
    
    const userStats = {};
    orders.forEach(order => {
        const token = order.token || 'Unknown';
        if (!userStats[token]) {
            userStats[token] = {
                token: token,
                orderCount: 0,
                totalSpent: 0,
                lastOrder: order.date
            };
        }
        userStats[token].orderCount++;
        userStats[token].totalSpent += parseFloat(getOrderAmount(order));
    });
    
    const sortedUsers = Object.values(userStats)
        .filter(user => user.orderCount >= 2)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 10);
    
    if (sortedUsers.length === 0) {
        usersList.innerHTML = '<p class="empty-state">No regular users yet</p>';
        return;
    }
    
    usersList.innerHTML = sortedUsers.map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '👤';
        
        return `
            <div class="user-card">
                <div class="user-avatar-small">${medal}</div>
                <div class="user-info">
                    <div class="user-name">Token #${user.token}</div>
                    <div class="user-stats">
                        <span><i class="fas fa-shopping-bag"></i> ${user.orderCount} orders</span>
                        <span><i class="fas fa-rupee-sign"></i> ₹${user.totalSpent.toFixed(2)}</span>
                        <span><i class="far fa-calendar"></i> Last: ${user.lastOrder}</span>
                    </div>
                </div>
                <div class="user-badge">
                    ${user.orderCount >= 5 ? '⭐ Regular' : '🌟 New'}
                </div>
            </div>
        `;
    }).join('');
}

// Show notification
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAccess();
    setInterval(loadData, 2000);
});