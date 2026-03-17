// Backend URL
const BASE_URL = "https://quickbite-canteen.onrender.com";

// Initialize cart
let cart = [];
let itemCounts = {};
let menuItems = [];
let selectedTable = null;
let orderType = null;

// Initialize tables in localStorage - ALL TABLES AVAILABLE
function initializeTables() {
    const existingTables = localStorage.getItem('tables');
    if (!existingTables || existingTables === '[]' || existingTables === 'null') {
        const tables = [];
        for (let i = 1; i <= 20; i++) {
            tables.push({
                id: i,
                number: i,
                status: 'available',
                capacity: i % 2 === 0 ? 4 : 2
            });
        }
        localStorage.setItem('tables', JSON.stringify(tables));
        console.log('Tables initialized: 20 tables available');
    }
}

// Display user info from localStorage
function displayUserInfo() {
    const studentName = localStorage.getItem('studentName');
    const userRole = localStorage.getItem('userRole');
    
    const greetingElement = document.getElementById('user-greeting');
    const roleElement = document.getElementById('user-role');
    const avatarElement = document.getElementById('user-avatar');
    
    if (studentName && greetingElement) {
        greetingElement.innerHTML = `Hello, ${studentName}!`;
    }
    
    if (userRole && roleElement) {
        let roleText = userRole === 'student' ? 'Student' : userRole === 'staff' ? 'Staff' : 'User';
        roleElement.innerHTML = roleText;
        
        if (avatarElement) {
            avatarElement.innerHTML = userRole === 'student' ? '👨‍🎓' : userRole === 'staff' ? '👨‍🏫' : '👤';
        }
    }
}

// Load menu with availability from admin
function loadMenuWithAvailability() {
    const defaultMenuItems = [
        { id: 1, name: 'Veg Sandwich', category: 'breakfast', price: 35 },
        { id: 2, name: 'Veg Maggi', category: 'breakfast', price: 40 },
        { id: 3, name: 'Poha', category: 'breakfast', price: 25 },
        { id: 4, name: 'Upma', category: 'breakfast', price: 25 },
        { id: 5, name: 'Aloo Paratha', category: 'breakfast', price: 45 },
        { id: 6, name: 'Chole Bhature', category: 'breakfast', price: 60 },
        { id: 7, name: 'Samosa', category: 'breakfast', price: 20 },
        { id: 8, name: 'Bread Pakora', category: 'breakfast', price: 25 },
        { id: 9, name: 'North Indian Thali', category: 'meals', price: 80 },
        { id: 10, name: 'South Indian Thali', category: 'meals', price: 75 },
        { id: 11, name: 'Veg Biryani', category: 'meals', price: 65 },
        { id: 12, name: 'Rajma Chawal', category: 'meals', price: 50 },
        { id: 13, name: 'Kadhi Chawal', category: 'meals', price: 50 },
        { id: 14, name: 'Veg Pulao', category: 'meals', price: 45 },
        { id: 15, name: 'Veg Chowmein', category: 'chinese', price: 50 },
        { id: 16, name: 'Gobi Manchurian', category: 'chinese', price: 60 },
        { id: 17, name: 'Spring Rolls', category: 'chinese', price: 40 },
        { id: 18, name: 'Chilli Potato', category: 'chinese', price: 55 },
        { id: 19, name: 'Vada Pav', category: 'snacks', price: 20 },
        { id: 20, name: 'Pav Bhaji', category: 'snacks', price: 80 },
        { id: 21, name: 'Veg Frankie', category: 'snacks', price: 50 },
        { id: 22, name: 'French Fries', category: 'snacks', price: 45 },
        { id: 23, name: 'Veg Cutlet', category: 'snacks', price: 35 },
        { id: 24, name: 'Masala Chai', category: 'beverages', price: 10 },
        { id: 25, name: 'Filter Coffee', category: 'beverages', price: 15 },
        { id: 26, name: 'Cold Coffee', category: 'beverages', price: 40 },
        { id: 27, name: 'Sweet Lassi', category: 'beverages', price: 35 },
        { id: 28, name: 'Buttermilk', category: 'beverages', price: 25 },
        { id: 29, name: 'Lemon Soda', category: 'beverages', price: 20 },
        { id: 30, name: 'Cold Drink', category: 'beverages', price: 25 },
        { id: 31, name: 'Chocolate Shake', category: 'beverages', price: 50 },
        { id: 32, name: 'Bun Maska Combo', category: 'combos', price: 30 },
        { id: 33, name: 'Toast Jam Combo', category: 'combos', price: 25 },
        { id: 34, name: 'Packet Chips', category: 'combos', price: 10 }
    ];
    
    const availabilityData = JSON.parse(localStorage.getItem('menuAvailability')) || [];
    
    menuItems = defaultMenuItems.map(item => {
        const availability = availabilityData.find(a => a.id === item.id);
        return {
            ...item,
            available: availability ? availability.available : true
        };
    });
    
    displayMenuItemsByCategory();
}

function displayMenuItemsByCategory() {
    const categories = {
        'breakfast': 'breakfast-items',
        'meals': 'meals-items',
        'chinese': 'chinese-items',
        'snacks': 'snacks-items',
        'beverages': 'beverages-items',
        'combos': 'combo-items'
    };
    
    for (const [category, elementId] of Object.entries(categories)) {
        const container = document.getElementById(elementId);
        if (!container) continue;
        
        const categoryItems = menuItems.filter(item => item.category === category);
        
        if (categoryItems.length === 0) {
            container.innerHTML = '<p class="empty-state">No items available</p>';
            continue;
        }
        
        container.innerHTML = categoryItems.map(item => `
            <div class="food-card ${!item.available ? 'item-unavailable' : ''}">
                <img src="${getItemImage(item.name)}" alt="${item.name}" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%23d63031\'/%3E%3Ctext x=\'50\' y=\'120\' fill=\'white\' font-size=\'24\'%3E${getItemEmoji(item.name)}%3C/text%3E%3C/svg%3E'">
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <p>${getItemDescription(item.name)}</p>
                    <span class="price">₹${item.price}</span>
                    ${!item.available ? '<span class="out-of-stock">Currently Unavailable</span>' : `
                        <div class="button-group">
                            <button class="add-btn" onclick="addToCart('${item.name}', ${item.price}, this)">Add +</button>
                            <button class="remove-btn" onclick="removeOneFromCart('${item.name}', this)" disabled>−</button>
                        </div>
                    `}
                </div>
            </div>
        `).join('');
    }
}

function getItemImage(itemName) {
    const images = {
        'Veg Sandwich': 'sandwhich.png', 'Veg Maggi': 'maggi.png', 'Poha': 'poha.png',
        'Upma': 'upma.png', 'Aloo Paratha': 'paratha.png', 'Chole Bhature': 'chole-bhature.png',
        'Samosa': 'samosa.png', 'Bread Pakora': 'bread-pakora.png', 'North Indian Thali': 'north-thali.png',
        'South Indian Thali': 'south-thali.png', 'Veg Biryani': 'biryani.png', 'Rajma Chawal': 'rajma.png',
        'Kadhi Chawal': 'kadhi.png', 'Veg Pulao': 'pulao.png', 'Veg Chowmein': 'chowmein.png',
        'Gobi Manchurian': 'manchurian.png', 'Spring Rolls': 'spring-rolls.png', 'Chilli Potato': 'chilli-potato.png',
        'Vada Pav': 'vada-pav.png', 'Pav Bhaji': 'pav-bhaji.png', 'Veg Frankie': 'frankie.png',
        'French Fries': 'fries.png', 'Veg Cutlet': 'cutlet.png', 'Masala Chai': 'chai.png',
        'Filter Coffee': 'coffee.png', 'Cold Coffee': 'cold-coffee.png', 'Sweet Lassi': 'lassi.png',
        'Buttermilk': 'buttermilk.png', 'Lemon Soda': 'lemon-soda.png', 'Cold Drink': 'cold-drink.png',
        'Chocolate Shake': 'chocolate-shake.png', 'Bun Maska Combo': 'bun-maska.png',
        'Toast Jam Combo': 'toast.png', 'Packet Chips': 'chips.png'
    };
    return images[itemName] || 'default-food.png';
}

function getItemEmoji(itemName) {
    const emojis = {
        'Veg Sandwich': '🥪', 'Veg Maggi': '🍜', 'Poha': '🥣', 'Upma': '🥘',
        'Aloo Paratha': '🫓', 'Chole Bhature': '🍛', 'Samosa': '🥟', 'Bread Pakora': '🍞',
        'North Indian Thali': '🍱', 'South Indian Thali': '🍚', 'Veg Biryani': '🍛',
        'Rajma Chawal': '🥘', 'Kadhi Chawal': '🥣', 'Veg Pulao': '🍚', 'Veg Chowmein': '🍜',
        'Gobi Manchurian': '🥦', 'Spring Rolls': '🌯', 'Chilli Potato': '🥔', 'Vada Pav': '🥪',
        'Pav Bhaji': '🍛', 'Veg Frankie': '🌯', 'French Fries': '🍟', 'Veg Cutlet': '🍘',
        'Masala Chai': '☕', 'Filter Coffee': '☕', 'Cold Coffee': '🥤', 'Sweet Lassi': '🥛',
        'Buttermilk': '🥛', 'Lemon Soda': '🍋', 'Cold Drink': '🥤', 'Chocolate Shake': '🍫',
        'Bun Maska Combo': '🥐', 'Toast Jam Combo': '🍞', 'Packet Chips': '🥔'
    };
    return emojis[itemName] || '🍽️';
}

function getItemDescription(itemName) {
    const descriptions = {
        'Veg Sandwich': 'Grilled sandwich with fresh veggies and cheese',
        'Veg Maggi': 'Hot & spicy noodles with veggies',
        'Poha': 'Flattened rice with peanuts and lemon',
        'Upma': 'South Indian semolina breakfast',
        'Aloo Paratha': 'Stuffed potato paratha with curd & pickle',
        'Chole Bhature': 'Spicy chickpea curry with fried bread',
        'Samosa': 'Crispy pastry with spiced potato filling',
        'Bread Pakora': 'Bread fritter with chutney',
        'North Indian Thali': '2 Rotis, Sabzi, Rice, Dal, Salad',
        'South Indian Thali': 'Rice, Sambhar, Rasam, Veg, Papad',
        'Veg Biryani': 'Aromatic rice with veggies & raita',
        'Rajma Chawal': 'Kidney bean curry with steamed rice',
        'Kadhi Chawal': 'Yogurt curry with rice and pakoras',
        'Veg Pulao': 'Flavored rice with raita',
        'Veg Chowmein': 'Hakka noodles with veggies',
        'Gobi Manchurian': 'Cauliflower in spicy sauce',
        'Spring Rolls': 'Crispy veg rolls with sauce',
        'Chilli Potato': 'Crispy potatoes in chilli sauce',
        'Vada Pav': 'Mumbai style spicy vada in bun',
        'Pav Bhaji': 'Mixed veg curry with buttered buns',
        'Veg Frankie': 'Rolled roti with spicy veg filling',
        'French Fries': 'Crispy potato fries with seasoning',
        'Veg Cutlet': 'Breaded veg patties with chutney',
        'Masala Chai': 'Hot spiced tea',
        'Filter Coffee': 'South Indian filter coffee',
        'Cold Coffee': 'Chilled coffee with ice cream',
        'Sweet Lassi': 'Thick yogurt drink',
        'Buttermilk': 'Spiced yogurt drink',
        'Lemon Soda': 'Fresh lime with soda',
        'Cold Drink': 'Assorted soft drinks',
        'Chocolate Shake': 'Thick chocolate milkshake',
        'Bun Maska Combo': 'Buttered bun with hot tea',
        'Toast Jam Combo': '2 toast slices with jam and tea',
        'Packet Chips': 'Assorted flavors (Lays/Kurkure)'
    };
    return descriptions[itemName] || 'Delicious canteen food';
}

function checkTableAvailability() {
    initializeTables();
    const tables = JSON.parse(localStorage.getItem('tables')) || [];
    const availableTables = tables.filter(t => t.status === 'available').length;
    
    const availabilityElement = document.getElementById('availability-message');
    const tableIndicator = document.getElementById('table-availability-text');
    const dineinAvailability = document.getElementById('dinein-availability');
    
    let message = `✅ ${availableTables} tables available`;
    let color = '#27ae60';
    
    if (availableTables === 0) {
        message = '❌ No tables available - Canteen is full!';
        color = '#e74c3c';
    } else if (availableTables < 5) {
        message = `⚠️ Only ${availableTables} tables left - Hurry!`;
        color = '#f39c12';
    }
    
    if (availabilityElement) {
        availabilityElement.innerHTML = message;
        availabilityElement.style.color = color;
    }
    
    if (tableIndicator) {
        tableIndicator.innerHTML = message;
        tableIndicator.style.color = color;
    }
    
    if (dineinAvailability) {
        dineinAvailability.innerHTML = message;
        dineinAvailability.style.color = color;
    }
    
    return { availableTables, tables };
}

function showTableAvailability() {
    const { tables } = checkTableAvailability();
    const grid = document.getElementById('tables-display-grid');
    const statusEl = document.getElementById('canteen-status');
    
    if (!grid) return;
    
    const availableCount = tables.filter(t => t.status === 'available').length;
    statusEl.innerHTML = `<span class="tables-available">✅ ${availableCount} tables available</span>`;
    
    grid.innerHTML = tables.map(table => `
        <div class="table-display-card ${table.status}">
            <div class="table-number">Table ${table.number}</div>
            <div class="table-status ${table.status}">
                ${table.status === 'available' ? '✅ Available' : 
                  table.status === 'occupied' ? '👤 Occupied' : '📅 Reserved'}
            </div>
            <div class="table-capacity">👥 Capacity: ${table.capacity}</div>
        </div>
    `).join('');
    
    openModal('table-modal');
}

function showOrderTypeModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const now = new Date();
    const hour = now.getHours();
    // 🕒 UPDATED: 9 AM to 9 PM
    if (hour < 9 || hour >= 21) {
        alert('🕒 Canteen is closed! Orders can only be placed between 9 AM - 9 PM.');
        return;
    }
    
    checkTableAvailability();
    selectedTable = null;
    orderType = null;
    
    const confirmBtn = document.getElementById('confirm-table-btn');
    if (confirmBtn) confirmBtn.disabled = true;
    
    openModal('order-type-modal');
}

function selectOrderType(type) {
    orderType = type;
    
    if (type === 'takeaway') {
        closeOrderTypeModal();
        proceedToCheckout();
    } else if (type === 'dinein') {
        closeOrderTypeModal();
        showTableSelection();
    }
}

function showTableSelection() {
    const tables = JSON.parse(localStorage.getItem('tables')) || [];
    const availableTables = tables.filter(t => t.status === 'available').length;
    const grid = document.getElementById('tables-selection-grid');
    const noTablesMsg = document.getElementById('no-tables-message');
    const confirmBtn = document.getElementById('confirm-table-btn');
    
    if (!grid) return;
    
    if (availableTables === 0) {
        grid.style.display = 'none';
        if (noTablesMsg) noTablesMsg.style.display = 'block';
        if (confirmBtn) confirmBtn.disabled = true;
    } else {
        grid.style.display = 'grid';
        if (noTablesMsg) noTablesMsg.style.display = 'none';
        
        grid.innerHTML = tables.map(table => {
            if (table.status === 'available') {
                return `
                    <div class="table-select-card available selectable" onclick="selectTable(${table.id}, this)">
                        <div class="table-number">Table ${table.number}</div>
                        <div class="table-capacity">👥 Capacity: ${table.capacity}</div>
                        <div class="table-status available">✅ Available</div>
                        <div class="select-hint">Click to select</div>
                    </div>
                `;
            } else {
                return `
                    <div class="table-select-card ${table.status}">
                        <div class="table-number">Table ${table.number}</div>
                        <div class="table-capacity">👥 Capacity: ${table.capacity}</div>
                        <div class="table-status ${table.status}">
                            ${table.status === 'occupied' ? '👤 Occupied' : '📅 Reserved'}
                        </div>
                    </div>
                `;
            }
        }).join('');
    }
    
    openModal('table-selection-modal');
}

function selectTable(tableId, element) {
    document.querySelectorAll('.table-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedTable = tableId;
    
    const confirmBtn = document.getElementById('confirm-table-btn');
    if (confirmBtn) confirmBtn.disabled = false;
}

function confirmTableSelection() {
    if (!selectedTable) {
        alert('Please select a table');
        return;
    }
    
    closeTableSelectionModal();
    proceedToCheckout();
}

// FINAL CORRECTED proceedToCheckout FUNCTION
function proceedToCheckout() {
    console.log('proceedToCheckout called');
    console.log('Order Type:', orderType);
    console.log('Selected Table:', selectedTable);
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Save cart data for checkout
    localStorage.setItem('quickbite_cart', JSON.stringify(cart));
    localStorage.setItem('orderTotal', total.toString());
    localStorage.setItem('totalPrice', total.toString());
    localStorage.setItem('orderType', orderType);
    
    // Generate a unique token for this order
    const orderToken = 'TK' + Math.floor(100000 + Math.random() * 900000);
    
    // Create order object for previous-orders
    const orderData = {
        token: orderToken,
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: 1
        })),
        amount: total,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Processing',
        orderType: orderType,
        tableNumber: orderType === 'dinein' ? selectedTable : null,
        timestamp: Date.now()
    };
    
    console.log('Saving order directly to previousOrders:', orderData);
    
    // Save to previousOrders directly
    let previousOrders = JSON.parse(localStorage.getItem('previousOrders')) || [];
    previousOrders.push(orderData);
    localStorage.setItem('previousOrders', JSON.stringify(previousOrders));
    
    // Also save to allOrders for backup
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(orderData);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    
    if (orderType === 'dinein' && selectedTable) {
        localStorage.setItem('selectedTable', selectedTable.toString());
        console.log('✅ Table selected for dine-in:', selectedTable);
        updateTableStatus(parseInt(selectedTable), 'occupied');
        localStorage.removeItem('takeawayToken');
    } else {
        localStorage.removeItem('selectedTable');
        const token = 'TK' + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem('takeawayToken', token);
        console.log('✅ Token generated for takeaway:', token);
    }
    
    // Redirect to checkout
    window.location.href = 'checkout.html';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) modal.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) modal.style.display = 'none';
    if (overlay && !document.querySelector('.modal[style*="display: block"]')) {
        overlay.style.display = 'none';
    }
}

function closeTableModal() { closeModal('table-modal'); }
function closeOrderTypeModal() { closeModal('order-type-modal'); }
function closeTableSelectionModal() { 
    closeModal('table-selection-modal');
    selectedTable = null;
}
function closeAllModals() {
    closeModal('table-modal');
    closeModal('order-type-modal');
    closeModal('table-selection-modal');
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTables();
    displayUserInfo();
    loadMenuWithAvailability();
    updateCartDisplay();
    updateRemoveButtons();
    checkCanteenStatus();
    checkTableAvailability();
    
    setInterval(() => {
        loadMenuWithAvailability();
        checkTableAvailability();
    }, 30000);
    
    const chatInput = document.getElementById('user-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }
    
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAllModals);
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
}

function showOffers() {
    alert('🎉 Special Offers!\n• Buy 2 Samosa get 1 Free\n• Maggi + Chai @ ₹45\n• 10% off on orders above ₹200');
    toggleSidebar();
}

function showPreviousOrders() {
    window.location.href = 'previous-orders.html';
    toggleSidebar();
}

function showCombos() {
    alert('🍽️ Student Combos:\n• Coffee + Sandwich - ₹45\n• 2 Samosa + 2 Chai - ₹50\n• Thali + Lassi - ₹100');
    toggleSidebar();
}

function showFavorites() {
    alert('❤️ Your Favorites will appear here');
    toggleSidebar();
}

function showFeedback() {
    alert('⭐ Please share your feedback at feedback@quickbite.com');
    toggleSidebar();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('studentName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('quickbite_cart');
        localStorage.removeItem('orderTotal');
        localStorage.removeItem('totalPrice');
        window.location.href = 'q_index.html';
    }
}

function addToCart(itemName, price, button) {
    const now = new Date();
    const hour = now.getHours();
    // 🕒 UPDATED: 9 AM to 9 PM
    if (hour < 9 || hour >= 21) {
        alert('🕒 Canteen is closed! Open 9 AM - 9 PM.');
        return;
    }
    
    const menuItem = menuItems.find(item => item.name === itemName);
    if (!menuItem || !menuItem.available) {
        alert('❌ This item is unavailable!');
        return;
    }

    cart.push({ id: Date.now() + Math.random(), name: itemName, price: price });
    itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
    
    updateCartDisplay();
    updateRemoveButtons();
    
    button.innerText = "✓ Added!";
    button.classList.add('added');
    button.disabled = true;
    
    setTimeout(() => {
        button.innerText = "Add +";
        button.classList.remove('added');
        button.disabled = false;
    }, 500);
    
    document.getElementById('cart-bar').classList.remove('cart-hidden');
}

function removeOneFromCart(itemName, button) {
    for (let i = cart.length - 1; i >= 0; i--) {
        if (cart[i].name === itemName) {
            cart.splice(i, 1);
            break;
        }
    }
    
    itemCounts[itemName] = Math.max(0, (itemCounts[itemName] || 0) - 1);
    updateCartDisplay();
    updateRemoveButtons();
    
    if (cart.length === 0) {
        document.getElementById('cart-bar').classList.add('cart-hidden');
    }
}

function removeSpecificItem(itemId, itemName) {
    cart = cart.filter(item => item.id !== itemId);
    itemCounts[itemName] = Math.max(0, (itemCounts[itemName] || 0) - 1);
    updateCartDisplay();
    updateRemoveButtons();
    
    if (cart.length === 0) {
        document.getElementById('cart-bar').classList.add('cart-hidden');
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (cartCount) cartCount.textContent = cart.length;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (totalPrice) totalPrice.textContent = total;
    
    if (cartItemsList) {
        if (cart.length > 0) {
            const groupedItems = {};
            cart.forEach(item => {
                if (!groupedItems[item.name]) {
                    groupedItems[item.name] = { count: 1, ids: [item.id] };
                } else {
                    groupedItems[item.name].count++;
                    groupedItems[item.name].ids.push(item.id);
                }
            });
            
            cartItemsList.innerHTML = Object.entries(groupedItems).map(([name, data]) => `
                <span class="cart-item-tag">
                    ${name} x${data.count}
                    <button onclick="removeSpecificItem('${data.ids[0]}', '${name}')">−</button>
                </span>
            `).join('');
        } else {
            cartItemsList.innerHTML = '';
        }
    }
}

function updateRemoveButtons() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        const cardInfo = button.closest('.card-info');
        if (cardInfo) {
            const itemName = cardInfo.querySelector('h3').textContent;
            button.disabled = !(itemCounts[itemName] > 0);
            button.style.opacity = itemCounts[itemName] > 0 ? '1' : '0.5';
        }
    });
}

function clearCart() {
    if (confirm('Clear cart?')) {
        cart = [];
        itemCounts = {};
        updateCartDisplay();
        updateRemoveButtons();
        document.getElementById('cart-bar').classList.add('cart-hidden');
    }
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    if (chatWindow) chatWindow.classList.toggle('chat-hidden');
    if (chatBubble) chatBubble.classList.toggle('active');
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (message === '') return;
    
    const chatBody = document.getElementById('chat-body');
    
    const userMsg = document.createElement('p');
    userMsg.className = 'user-msg';
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);
    
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
    
    setTimeout(() => {
        const botMsg = document.createElement('p');
        botMsg.className = 'bot-msg';
        
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('time') || lowerMsg.includes('open')) {
            // 🕒 UPDATED: 9 AM to 9 PM
            botMsg.textContent = "🕒 Canteen timings: 9:00 AM to 9:00 PM";
        }
        else if (lowerMsg.includes('table')) {
            const tables = JSON.parse(localStorage.getItem('tables')) || [];
            const availableTables = tables.filter(t => t.status === 'available').length;
            botMsg.textContent = availableTables === 0 ? 
                "❌ No tables available" : 
                `✅ ${availableTables} tables available`;
        }
        else if (lowerMsg.includes('special')) {
            botMsg.textContent = "🍛 Today's Specials: Chole Bhature - ₹60, Pav Bhaji - ₹80";
        } 
        else if (lowerMsg.includes('menu')) {
            botMsg.textContent = "📋 Items: ₹10-₹80. Breakfast, Meals, Chinese, Snacks, Beverages";
        }
        else {
            // 🕒 UPDATED: 9 AM to 9 PM
            botMsg.textContent = "Hi! Canteen open 9 AM - 9 PM. How can I help?";
        }
        
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);
}

function checkCanteenStatus() {
    const now = new Date();
    const hour = now.getHours();
    const statusElement = document.getElementById('timing-info');
    
    if (statusElement) {
        // 🕒 UPDATED: 9 AM to 9 PM
        if (hour >= 9 && hour < 21) {
            statusElement.innerHTML = '<i class="fas fa-clock"></i> Open Now: 9:00 AM - 9:00 PM <i class="fas fa-check-circle" style="color: #2ecc71;"></i>';
            statusElement.style.background = 'rgba(46, 204, 113, 0.2)';
        } else {
            statusElement.innerHTML = '<i class="fas fa-clock"></i> Closed: Opens at 9:00 AM <i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
            statusElement.style.background = 'rgba(231, 76, 60, 0.2)';
        }
    }
}

function updateTableStatus(tableId, status) {
    const tables = JSON.parse(localStorage.getItem('tables')) || [];
    const tableIndex = tables.findIndex(t => t.id == tableId);
    if (tableIndex !== -1) {
        tables[tableIndex].status = status;
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%23d63031\'/%3E%3Ctext x=\'50\' y=\'120\' fill=\'white\' font-size=\'24\'%3E🍽️ Food%3C/text%3E%3C/svg%3E';
        };
    });
});

window.showOrderTypeModal = showOrderTypeModal;
window.selectOrderType = selectOrderType;
window.showTableAvailability = showTableAvailability;
window.selectTable = selectTable;
window.confirmTableSelection = confirmTableSelection;
window.closeTableModal = closeTableModal;
window.closeOrderTypeModal = closeOrderTypeModal;
window.closeTableSelectionModal = closeTableSelectionModal;
window.closeAllModals = closeAllModals;
window.toggleSidebar = toggleSidebar;
window.showOffers = showOffers;
window.showPreviousOrders = showPreviousOrders;
window.showCombos = showCombos;
window.showFavorites = showFavorites;
window.showFeedback = showFeedback;
window.logout = logout;
window.addToCart = addToCart;
window.removeOneFromCart = removeOneFromCart;
window.removeSpecificItem = removeSpecificItem;
window.clearCart = clearCart;
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;