// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const cartBar = document.getElementById('cart-bar');
    const cartCountDisplay = document.getElementById('cart-count');
    const totalPriceDisplay = document.getElementById('total-price');
    const checkoutAmountDisplay = document.getElementById('amount-to-pay'); // For checkout.html

    // --- NEW: SESSIONS RESET ---
    // If you want to clear the old order when the page refreshes for the first time
    // localStorage.removeItem('canteenCart'); 
    // localStorage.setItem('totalPrice', '0');

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('canteenCart')) || [];
    let totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    
    // Update display immediately on load
    updateCartDisplay();
    
    // --- MENU PAGE: Add to Cart ---
    window.addToCart = function(itemName, price) {
        // Add to cart array
        cart.push({ name: itemName, price: price });
        totalPrice += price;
        
        // Save to localStorage
        localStorage.setItem('canteenCart', JSON.stringify(cart));
        localStorage.setItem('totalPrice', totalPrice.toString());
        
        // Update display
        updateCartDisplay();
        
        // Show cart bar if hidden
        if (cartBar) {
            cartBar.classList.remove('cart-hidden');
        }
        
        // Button animation logic
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
        
        // Update checkout page if we are on it
        if (checkoutAmountDisplay) checkoutAmountDisplay.innerText = "₹" + totalPrice;

        // Show/hide cart bar
        if (cartBar) {
            if (cart.length > 0) {
                cartBar.classList.remove('cart-hidden');
            } else {
                cartBar.classList.add('cart-hidden');
            }
        }
    }
    
    // --- RESET LOGIC: Clear Tray ---
    window.clearTray = function() {
        cart = [];
        totalPrice = 0;
        localStorage.removeItem('canteenCart');
        localStorage.setItem('totalPrice', '0');
        updateCartDisplay();
        alert("Tray cleared!");
    };

    // --- CHECKOUT LOGIC: Payment Button ---
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