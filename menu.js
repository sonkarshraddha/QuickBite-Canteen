// Backend URL
const BASE_URL = "https://quickbite-canteen.onrender.com";

// Initialize cart
let cart = [];
let itemCounts = {};
let menuItems = []; // Store menu items with availability
let selectedTable = null; // Store selected table for dine-in
let orderType = null; // 'takeaway' or 'dinein'

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
        let roleText = '';
        if (userRole === 'student') roleText = 'Student';
        else if (userRole === 'staff') roleText = 'Staff';
        else roleText = 'User';
        
        roleElement.innerHTML = roleText;
        
        if (avatarElement) {
            if (userRole === 'student') avatarElement.innerHTML = '👨‍🎓';
            else if (userRole === 'staff') avatarElement.innerHTML = '👨‍🏫';
        }
    }
}

// Load menu with availability from admin
function loadMenuWithAvailability() {
    // Load default menu items (same as admin)
    const defaultMenuItems = [
        // Breakfast
        { id: 1, name: 'Veg Sandwich', category: 'breakfast', price: 35 },
        { id: 2, name: 'Veg Maggi', category: 'breakfast', price: 40 },
        { id: 3, name: 'Poha', category: 'breakfast', price: 25 },
        { id: 4, name: 'Upma', category: 'breakfast', price: 25 },
        { id: 5, name: 'Aloo Paratha', category: 'breakfast', price: 45 },
        { id: 6, name: 'Chole Bhature', category: 'breakfast', price: 60 },
        { id: 7, name: 'Samosa', category: 'breakfast', price: 20 },
        { id: 8, name: 'Bread Pakora', category: 'breakfast', price: 25 },
        
        // Main Meals
        { id: 9, name: 'North Indian Thali', category: 'meals', price: 80 },
        { id: 10, name: 'South Indian Thali', category: 'meals', price: 75 },
        { id: 11, name: 'Veg Biryani', category: 'meals', price: 65 },
        { id: 12, name: 'Rajma Chawal', category: 'meals', price: 50 },
        { id: 13, name: 'Kadhi Chawal', category: 'meals', price: 50 },
        { id: 14, name: 'Veg Pulao', category: 'meals', price: 45 },
        
        // Chinese
        { id: 15, name: 'Veg Chowmein', category: 'chinese', price: 50 },
        { id: 16, name: 'Gobi Manchurian', category: 'chinese', price: 60 },
        { id: 17, name: 'Spring Rolls', category: 'chinese', price: 40 },
        { id: 18, name: 'Chilli Potato', category: 'chinese', price: 55 },
        
        // Snacks
        { id: 19, name: 'Vada Pav', category: 'snacks', price: 20 },
        { id: 20, name: 'Pav Bhaji', category: 'snacks', price: 80 },
        { id: 21, name: 'Veg Frankie', category: 'snacks', price: 50 },
        { id: 22, name: 'French Fries', category: 'snacks', price: 45 },
        { id: 23, name: 'Veg Cutlet', category: 'snacks', price: 35 },
        
        // Beverages
        { id: 24, name: 'Masala Chai', category: 'beverages', price: 10 },
        { id: 25, name: 'Filter Coffee', category: 'beverages', price: 15 },
        { id: 26, name: 'Cold Coffee', category: 'beverages', price: 40 },
        { id: 27, name: 'Sweet Lassi', category: 'beverages', price: 35 },
        { id: 28, name: 'Buttermilk', category: 'beverages', price: 25 },
        { id: 29, name: 'Lemon Soda', category: 'beverages', price: 20 },
        { id: 30, name: 'Cold Drink', category: 'beverages', price: 25 },
        { id: 31, name: 'Chocolate Shake', category: 'beverages', price: 50 },
        
        // Combos
        { id: 32, name: 'Bun Maska Combo', category: 'combos', price: 30 },
        { id: 33, name: 'Toast Jam Combo', category: 'combos', price: 25 },
        { id: 34, name: 'Packet Chips', category: 'combos', price: 10 }
    ];
    
    // Get availability from admin (stored in localStorage by admin panel)
    const availabilityData = JSON.parse(localStorage.getItem('menuAvailability')) || [];
    
    // Merge availability with menu items
    menuItems = defaultMenuItems.map(item => {
        const availability = availabilityData.find(a => a.id === item.id);
        return {
            ...item,
            available: availability ? availability.available : true // Default to true if not set
        };
    });
    
    // Display items by category
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

// Helper function to get image placeholder
function getItemImage(itemName) {
    const images = {
        'Veg Sandwich': 'sandwhich.png',
        'Veg Maggi': 'maggi.png',
        'Poha': 'poha.png',
        'Upma': 'upma.png',
        'Aloo Paratha': 'paratha.png',
        'Chole Bhature': 'chole-bhature.png',
        'Samosa': 'samosa.png',
        'Bread Pakora': 'bread-pakora.png',
        'North Indian Thali': 'north-thali.png',
        'South Indian Thali': 'south-thali.png',
        'Veg Biryani': 'biryani.png',
        'Rajma Chawal': 'rajma.png',
        'Kadhi Chawal': 'kadhi.png',
        'Veg Pulao': 'pulao.png',
        'Veg Chowmein': 'chowmein.png',
        'Gobi Manchurian': 'manchurian.png',
        'Spring Rolls': 'spring-rolls.png',
        'Chilli Potato': 'chilli-potato.png',
        'Vada Pav': 'vada-pav.png',
        'Pav Bhaji': 'pav-bhaji.png',
        'Veg Frankie': 'frankie.png',
        'French Fries': 'fries.png',
        'Veg Cutlet': 'cutlet.png',
        'Masala Chai': 'chai.png',
        'Filter Coffee': 'coffee.png',
        'Cold Coffee': 'cold-coffee.png',
        'Sweet Lassi': 'lassi.png',
        'Buttermilk': 'buttermilk.png',
        'Lemon Soda': 'lemon-soda.png',
        'Cold Drink': 'cold-drink.png',
        'Chocolate Shake': 'chocolate-shake.png',
        'Bun Maska Combo': 'bun-maska.png',
        'Toast Jam Combo': 'toast.png',
        'Packet Chips': 'chips.png'
    };
    return images[itemName] || 'default-food.png';
}

function getItemEmoji(itemName) {
    const emojis = {
        'Veg Sandwich': '🥪',
        'Veg Maggi': '🍜',
        'Poha': '🥣',
        'Upma': '🥘',
        'Aloo Paratha': '🫓',
        'Chole Bhature': '🍛',
        'Samosa': '🥟',
        'Bread Pakora': '🍞',
        'North Indian Thali': '🍱',
        'South Indian Thali': '🍚',
        'Veg Biryani': '🍛',
        'Rajma Chawal': '🥘',
        'Kadhi Chawal': '🥣',
        'Veg Pulao': '🍚',
        'Veg Chowmein': '🍜',
        'Gobi Manchurian': '🥦',
        'Spring Rolls': '🌯',
        'Chilli Potato': '🥔',
        'Vada Pav': '🥪',
        'Pav Bhaji': '🍛',
        'Veg Frankie': '🌯',
        'French Fries': '🍟',
        'Veg Cutlet': '🍘',
        'Masala Chai': '☕',
        'Filter Coffee': '☕',
        'Cold Coffee': '🥤',
        'Sweet Lassi': '🥛',
        'Buttermilk': '🥛',
        'Lemon Soda': '🍋',
        'Cold Drink': '🥤',
        'Chocolate Shake': '🍫',
        'Bun Maska Combo': '🥐',
        'Toast Jam Combo': '🍞',
        'Packet Chips': '🥔'
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

// Table Availability Functions
function checkTableAvailability() {
    const tables = JSON.parse(localStorage.getItem('tables')) || [];
    const availableTables = tables.filter(t => t.status === 'available').length;
    const totalTables = tables.length || 20;
    
    const availabilityElement = document.getElementById('availability-message');
    const tableIndicator = document.getElementById('table-availability-text');
    const dineinAvailability = document.getElementById('dinein-availability');
    
    let message = '';
    let color = '';
    
    if (availableTables === 0) {
        message = '❌ No tables available - Canteen is full!';
        color = '#e74c3c';
    } else if (availableTables < 5) {
        message = `⚠️ Only ${availableTables} tables left - Hurry!`;
        color = '#f39c12';
    } else {
        message = `✅ ${availableTables} tables available`;
        color = '#27ae60';
    }
    
    if (availabilityElement) {
        availabilityElement.innerHTML = message;
        availabilityElement.style.color = color;
    }
    
    if (tableIndicator) {
        tableIndicator.innerHTML = `${availableTables} seats available`;
        tableIndicator.style.color = color;
    }
    
    if (dineinAvailability) {
        if (availableTables === 0) {
            dineinAvailability.innerHTML = '❌ No tables available';
            dineinAvailability.style.color = '#e74c3c';
        } else {
            dineinAvailability.innerHTML = `✅ ${availableTables} tables available`;
            dineinAvailability.style.color = '#27ae60';
        }
    }
    
    return { availableTables, totalTables, tables };
}

// Show table availability modal
function showTableAvailability() {
    const { tables } = checkTableAvailability();
    const grid = document.getElementById('tables-display-grid');
    const statusEl = document.getElementById('canteen-status');
    
    if (!grid) return;
    
    const availableCount = tables.filter(t => t.status === 'available').length;
    
    if (availableCount === 0) {
        statusEl.innerHTML = '<span class="canteen-full">🏪 Canteen is currently full. Please try takeaway or wait.</span>';
    } else {
        statusEl.innerHTML = `<span class="tables-available">✅ ${availableCount} tables available</span>`;
    }
    
    grid.innerHTML = tables.map(table => `
        <div class="table-display-card ${table.status}">
            <div class="table-number">Table ${table.number}</div>
            <div class="table-status ${table.status}">
                ${table.status === 'available' ? '✅ Available' : 
                  table.status === 'occupied' ? '👤 Occupied' : '📅 Reserved'}
            </div>
        </div>
    `).join('');
    
    openModal('table-modal');
}

// Order Type Functions
function showOrderTypeModal() {
    console.log('showOrderTypeModal called'); // Debug log
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Check if canteen is open
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11 || hour >= 20) {
        alert('🕒 Canteen is closed! Orders can only be placed between 11 AM - 6 PM.');
        return;
    }
    
    // Update dine-in availability
    checkTableAvailability();
    
    // Reset selections
    selectedTable = null;
    orderType = null;
    
    // Make sure confirm button is disabled
    const confirmBtn = document.getElementById('confirm-table-btn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
    }
    
    // Open the order type modal
    console.log('Opening order-type-modal'); // Debug log
    openModal('order-type-modal');
}

function selectOrderType(type) {
    console.log('selectOrderType called with:', type); // Debug log
    
    orderType = type;
    
    if (type === 'takeaway') {
        // Proceed directly to checkout for takeaway
        closeOrderTypeModal();
        proceedToCheckout();
    } else if (type === 'dinein') {
        // Show table selection for dine-in
        closeOrderTypeModal();
        showTableSelection();
    }
}

function showTableSelection() {
    console.log('showTableSelection called'); // Debug log
    
    const { tables, availableTables } = checkTableAvailability();
    const grid = document.getElementById('tables-selection-grid');
    const noTablesMsg = document.getElementById('no-tables-message');
    
    if (!grid) {
        console.error('tables-selection-grid not found');
        return;
    }
    
    if (availableTables === 0) {
        grid.style.display = 'none';
        if (noTablesMsg) noTablesMsg.style.display = 'block';
        document.getElementById('confirm-table-btn').disabled = true;
    } else {
        grid.style.display = 'grid';
        if (noTablesMsg) noTablesMsg.style.display = 'none';
        
        grid.innerHTML = tables.map(table => {
            if (table.status === 'available') {
                return `
                    <div class="table-select-card available selectable" onclick="selectTable(${table.id})">
                        <div class="table-number">Table ${table.number}</div>
                        <div class="table-status available">✅ Available</div>
                        <div class="select-hint">Click to select</div>
                    </div>
                `;
            } else {
                return `
                    <div class="table-select-card ${table.status}">
                        <div class="table-number">Table ${table.number}</div>
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

function selectTable(tableId) {
    console.log('selectTable called with:', tableId); // Debug log
    
    // Remove previous selection
    document.querySelectorAll('.table-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked table
    const selectedCard = event.currentTarget;
    selectedCard.classList.add('selected');
    
    // Store selected table
    selectedTable = tableId;
    
    // Enable confirm button
    document.getElementById('confirm-table-btn').disabled = false;
}

function confirmTableSelection() {
    console.log('confirmTableSelection called'); // Debug log
    
    if (!selectedTable) {
        alert('Please select a table');
        return;
    }
    
    closeTableSelectionModal();
    proceedToCheckout();
}

function proceedToCheckout() {
    console.log('proceedToCheckout called'); // Debug log
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Save cart data
    localStorage.setItem('quickbite_cart', JSON.stringify(cart));
    localStorage.setItem('orderTotal', total.toString());
    localStorage.setItem('totalPrice', total.toString());
    
    // Save order type and table info
    localStorage.setItem('orderType', orderType);
    if (orderType === 'dinein' && selectedTable) {
        localStorage.setItem('selectedTable', selectedTable);
    } else {
        localStorage.removeItem('selectedTable');
    }
    
    // Redirect to checkout
    console.log('Redirecting to checkout.html'); // Debug log
    window.location.href = 'checkout.html';
}

// Modal Functions
function openModal(modalId) {
    console.log('openModal called with:', modalId); // Debug log
    
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Modal not found:', modalId);
    }
    
    if (overlay) {
        overlay.style.display = 'block';
    }
}

function closeModal(modalId) {
    console.log('closeModal called with:', modalId); // Debug log
    
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (overlay && !document.querySelector('.modal[style*="display: block"]')) {
        overlay.style.display = 'none';
    }
}

function closeTableModal() {
    closeModal('table-modal');
}

function closeOrderTypeModal() {
    closeModal('order-type-modal');
}

function closeTableSelectionModal() {
    closeModal('table-selection-modal');
    selectedTable = null;
}

function closeAllModals() {
    console.log('closeAllModals called'); // Debug log
    
    closeModal('table-modal');
    closeModal('order-type-modal');
    closeModal('table-selection-modal');
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded'); // Debug log
    
    displayUserInfo();
    loadMenuWithAvailability();
    updateCartDisplay();
    updateRemoveButtons();
    checkCanteenStatus();
    checkTableAvailability();
    
    // Refresh availability every 30 seconds
    setInterval(() => {
        loadMenuWithAvailability();
        checkTableAvailability();
    }, 30000);
    
    // Set up chat input enter key
    const chatInput = document.getElementById('user-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Close sidebar when clicking on overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            toggleSidebar();
        });
    }
    
    // Close modals when clicking on modal overlay
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            closeAllModals();
        });
    }
});

// Sidebar functions
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}

function showOffers() {
    alert('🎉 Special Offers for Students!\n\n• Buy 2 Samosa get 1 Free\n• Combo: Maggi + Chai @ ₹45 only\n• 10% off on orders above ₹200');
    toggleSidebar();
}

function showPreviousOrders() {
    window.location.href = 'previous-orders.html';
    toggleSidebar();
}

function showCombos() {
    alert('🍽️ Student Combos:\n\n• Study Combo: Coffee + Sandwich - ₹45\n• Party Combo: 2 Samosa + 2 Chai - ₹50\n• Heavy Meal: Thali + Lassi - ₹100');
    toggleSidebar();
}

function showFavorites() {
    alert('❤️ Your Favorites:\n\n• Veg Maggi\n• Masala Dosa\n• Cold Coffee');
    toggleSidebar();
}

function showFeedback() {
    alert('⭐ Rate Us!\n\nPlease share your feedback at feedback@quickbite.com');
    toggleSidebar();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('studentName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('cart');
        localStorage.removeItem('totalPrice');
        window.location.href = 'q_index.html';
    }
}

function addToCart(itemName, price, button) {
    // Check if canteen is open
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11 || hour >= 19) {
        alert('🕒 Canteen is currently closed! Open from 11 AM to 6 PM.');
        return;
    }
    
    // Check if item is available
    const menuItem = menuItems.find(item => item.name === itemName);
    if (!menuItem || !menuItem.available) {
        alert('❌ This item is currently unavailable!');
        return;
    }

    cart.push({
        id: Date.now() + Math.random(),
        name: itemName,
        price: price
    });
    
    itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
    
    updateCartDisplay();
    updateRemoveButtons();
    
    // Button animation
    const originalText = button.innerText;
    button.innerText = "✓ Added!";
    button.classList.add('added');
    button.disabled = true;
    
    setTimeout(() => {
        button.innerText = originalText;
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
    
    button.style.backgroundColor = '#e74c3c';
    setTimeout(() => {
        button.style.backgroundColor = '';
    }, 200);
    
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
    document.getElementById('cart-count').textContent = cart.length;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').textContent = total;
    
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (cart.length > 0) {
        const groupedItems = {};
        cart.forEach(item => {
            if (!groupedItems[item.name]) {
                groupedItems[item.name] = {
                    count: 1,
                    ids: [item.id]
                };
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
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        itemCounts = {};
        updateCartDisplay();
        updateRemoveButtons();
        document.getElementById('cart-bar').classList.add('cart-hidden');
    }
}

async function saveOrderToBackend(orderData) {
    try {
        const response = await fetch(`${BASE_URL}/place-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            console.log('Order saved to backend successfully');
        } else {
            console.error('Failed to save order to backend');
        }
    } catch (err) {
        console.error('Error saving order to backend:', err);
    }
}

// Chatbot functions
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('chat-hidden');
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
    
    setTimeout(() => {
        const botMsg = document.createElement('p');
        botMsg.className = 'bot-msg';
        
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('time') || lowerMsg.includes('open') || lowerMsg.includes('close')) {
            botMsg.textContent = "🕒 Canteen timings: 11:00 AM to 6:00 PM (Monday to Saturday)";
        }
        else if (lowerMsg.includes('table') || lowerMsg.includes('seat') || lowerMsg.includes('available')) {
            const tables = JSON.parse(localStorage.getItem('tables')) || [];
            const availableTables = tables.filter(t => t.status === 'available').length;
            if (availableTables === 0) {
                botMsg.textContent = "❌ No tables available right now. Please wait or order for takeaway.";
            } else {
                botMsg.textContent = `✅ ${availableTables} tables are available right now!`;
            }
        }
        else if (lowerMsg.includes('special') || lowerMsg.includes('today')) {
            botMsg.textContent = "🍛 Today's Specials:\n• Chole Bhature - ₹60\n• Pav Bhaji - ₹60\n• South Indian Combo - ₹60";
        } 
        else if (lowerMsg.includes('menu') || lowerMsg.includes('items')) {
            botMsg.textContent = "📋 We have:\n• Breakfast items (₹20-₹60)\n• Main Meals (₹45-₹80)\n• Chinese (₹40-₹60)\n• Snacks (₹20-₹60)\n• Beverages (₹10-₹50)";
        }
        else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
            botMsg.textContent = "💰 Price range: ₹10 to ₹80. Most items are between ₹30-₹60!";
        }
        else if (lowerMsg.includes('combo') || lowerMsg.includes('offer')) {
            botMsg.textContent = "🎉 Student Combos:\n• Maggi + Chai: ₹45\n• 2 Samosa + Chai: ₹35\n• Thali + Lassi: ₹100";
        }
        else if (lowerMsg.includes('where') || lowerMsg.includes('location')) {
            botMsg.textContent = "📍 We're located near the main college building, next to the library!";
        }
        else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            botMsg.textContent = "👋 Hello! Canteen is open 11 AM - 6 PM. What would you like to order?";
        }
        else if (lowerMsg.includes('takeaway') || lowerMsg.includes('dine in') || lowerMsg.includes('dine-in')) {
            botMsg.textContent = "🥡 Takeaway and 🍽️ Dine-In both available! Choose at checkout.";
        }
        else if (lowerMsg.includes('thank')) {
            botMsg.textContent = "😊 You're welcome! Enjoy your meal!";
        }
        else {
            botMsg.textContent = "Thanks for your message! I can help you with:\n• Menu items\n• Prices\n• Timings (11 AM - 6 PM)\n• Table availability\n• Takeaway vs Dine-In\n• Today's specials\n• Student combos";
        }
        
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Check canteen status
function checkCanteenStatus() {
    const now = new Date();
    const hour = now.getHours();
    const statusElement = document.getElementById('timing-info');
    
    if (statusElement) {
        if (hour >= 11 && hour < 18) {
            statusElement.innerHTML = '<i class="fas fa-clock"></i> Open Now: 11:00 AM - 6:00 PM <i class="fas fa-check-circle" style="color: #2ecc71; margin-left: 10px;"></i>';
            statusElement.style.background = 'rgba(46, 204, 113, 0.2)';
        } else {
            statusElement.innerHTML = '<i class="fas fa-clock"></i> Closed: Opens at 11:00 AM <i class="fas fa-times-circle" style="color: #e74c3c; margin-left: 10px;"></i>';
            statusElement.style.background = 'rgba(231, 76, 60, 0.2)';
        }
    }
}

// Handle image errors
document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%23d63031\'/%3E%3Ctext x=\'50\' y=\'120\' fill=\'white\' font-size=\'24\'%3E🍽️ Food%3C/text%3E%3C/svg%3E';
    };
});