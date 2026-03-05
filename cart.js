// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. THE GHOST KILLER & NAME DISPLAY ---
    // Forces clean start and shows student name
    const userDisplay = document.getElementById('user-display');
    const storedName = localStorage.getItem('studentName');
    
    if (userDisplay && storedName) {
        userDisplay.innerText = "Hello, " + storedName;
    }

    // --- 2. LOGOUT LOGIC ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            localStorage.clear(); // Wipes everything for a clean logout
            window.location.href = "index.html"; 
        });
    }

    // --- 3. CART INITIALIZATION ---
    const cartBar = document.getElementById('cart-bar');
    const cartCountDisplay = document.getElementById('cart-count');
    const totalPriceDisplay = document.getElementById('total-price');
    const checkoutAmountDisplay = document.getElementById('amount-to-pay');

    let cart = JSON.parse(localStorage.getItem('canteenCart')) || [];
    let totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    
    updateCartDisplay();
    
    // --- 4. MENU PAGE: Add to Cart ---
    window.addToCart = function(itemName, price) {
        cart.push({ name: itemName, price: price });
        totalPrice += price;
        
        localStorage.setItem('canteenCart', JSON.stringify(cart));
        localStorage.setItem('totalPrice', totalPrice.toString());
        
        updateCartDisplay();
        
        if (cartBar) {
            cartBar.classList.remove('cart-hidden');
        }
        
        if (event && event.target) {
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = "Added!";
            btn.style.backgroundColor = "#2ecc71";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "#d63031";
            }, 800);
        }
    };
    
    function updateCartDisplay() {
        if (cartCountDisplay) cartCountDisplay.innerText = cart.length;
        if (totalPriceDisplay) totalPriceDisplay.innerText = totalPrice;
        if (checkoutAmountDisplay) checkoutAmountDisplay.innerText = "₹" + totalPrice;

        if (cartBar) {
            if (cart.length > 0) {
                cartBar.classList.remove('cart-hidden');
            } else {
                cartBar.classList.add('cart-hidden');
            }
        }
    }
    
    // --- 5. RESET LOGIC ---
    window.clearTray = function() {
        cart = [];
        totalPrice = 0;
        localStorage.removeItem('canteenCart');
        localStorage.setItem('totalPrice', '0');
        updateCartDisplay();
        alert("Tray cleared!");
    };

    // --- 6. CHECKOUT LOGIC ---
    const payBtn = document.getElementById('confirm-pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', function() {
            if (totalPrice <= 0) {
                alert("Your tray is empty!");
                return;
            }
            const token = Math.floor(1000 + Math.random() * 9000);
            localStorage.setItem('displayToken', token);
            window.location.href = 'success.html';
        });
    }
});