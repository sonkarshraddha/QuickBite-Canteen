// Backend URL
const BASE_URL = "https://quickbite-canteen.onrender.com";

// Initialize cart
let cart = [];
let itemCounts = {};

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
        
        // Change avatar based on role
        if (avatarElement) {
            if (userRole === 'student') avatarElement.innerHTML = '👨‍🎓';
            else if (userRole === 'staff') avatarElement.innerHTML = '👨‍🏫';
        }
    }
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    // ... your existing code ...
});

// Load menu on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    updateRemoveButtons();
    checkCanteenStatus();
    
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
    document.getElementById('overlay').addEventListener('click', function() {
        toggleSidebar();
    });
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

// UPDATED: Redirect to previous.html instead of showing alert
function showPreviousOrders() {
    window.location.href = 'previous.html';
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

// UPDATED: Redirect to index.html (login page) instead of reloading
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any user session data
        localStorage.removeItem('studentName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('cart');
        localStorage.removeItem('totalPrice');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

function addToCart(itemName, price, button) {
    // Check if canteen is open (11 AM - 6 PM)
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11 || hour >= 18) {
        alert('🕒 Canteen is currently closed! Open from 11 AM to 6 PM.');
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

// Function to save order to backend
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

function viewCart() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Check if canteen is open before checkout
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11 || hour >= 18) {
        alert('🕒 Canteen is closed! Orders can only be placed between 11 AM - 6 PM.');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // ✅ FIX: Save cart data BEFORE redirecting
    localStorage.setItem('quickbite_cart', JSON.stringify(cart));
    localStorage.setItem('orderTotal', total.toString());
    localStorage.setItem('totalPrice', total.toString());
    
    // Generate token number
    const token = 'TK' + Math.floor(Math.random() * 1000);
    
    // Create order object
    const orderDetails = {
        token: token,
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: 1
        })),
        totalAmount: total,
        method: 'pending',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Pending',
        tableNumber: '1',
        customerName: localStorage.getItem('studentName') || 'Student',
        email: localStorage.getItem('userEmail') || 'student@college.edu'
    };
    
    // Save to backend
    saveOrderToBackend(orderDetails);
    
    // Save order to localStorage for checkout page
    localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
    
    // Also save to allOrders for admin panel
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(orderDetails);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    
    // Show order summary
    let orderSummary = '🧾 ORDER SUMMARY\n\n';
    const groupedItems = {};
    cart.forEach(item => {
        groupedItems[item.name] = (groupedItems[item.name] || 0) + 1;
    });
    
    Object.entries(groupedItems).forEach(([name, count]) => {
        const item = cart.find(i => i.name === name);
        orderSummary += `${name} x${count} = ₹${item.price * count}\n`;
    });
    
    orderSummary += `\nTotal: ₹${total}`;
    orderSummary += `\nToken: ${token}`;
    orderSummary += `\n\n✅ Please complete payment on next page!`;
    
    alert(orderSummary);
    
    // Clear cart after order
    clearCart();
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
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
    
    // Add user message
    const userMsg = document.createElement('p');
    userMsg.className = 'user-msg';
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);
    
    // Clear input
    input.value = '';
    
    // Bot response
    setTimeout(() => {
        const botMsg = document.createElement('p');
        botMsg.className = 'bot-msg';
        
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('time') || lowerMsg.includes('open') || lowerMsg.includes('close')) {
            botMsg.textContent = "🕒 Canteen timings: 11:00 AM to 6:00 PM (Monday to Saturday)";
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
        else if (lowerMsg.includes('thank')) {
            botMsg.textContent = "😊 You're welcome! Enjoy your meal!";
        }
        else {
            botMsg.textContent = "Thanks for your message! I can help you with:\n• Menu items\n• Prices\n• Timings (11 AM - 6 PM)\n• Today's specials\n• Student combos";
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