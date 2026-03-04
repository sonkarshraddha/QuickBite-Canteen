// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const cartBar = document.getElementById('cart-bar');
    const cartCountDisplay = document.getElementById('cart-count');
    const totalPriceDisplay = document.getElementById('total-price');
    
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('canteenCart')) || [];
    let totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    
    // Update display
    updateCartDisplay();
    
    // Make addToCart function global
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
        
        // Button animation
        event.target.innerText = "Added!";
        event.target.style.backgroundColor = "#2ecc71";
        setTimeout(() => {
            event.target.innerText = "Add +";
            event.target.style.backgroundColor = "#d63031";
        }, 800);
    };
    
    function updateCartDisplay() {
        if (cartCountDisplay) cartCountDisplay.innerText = cart.length;
        if (totalPriceDisplay) totalPriceDisplay.innerText = totalPrice;
        
        // Show/hide cart bar
        if (cartBar) {
            if (cart.length > 0) {
                cartBar.classList.remove('cart-hidden');
            } else {
                cartBar.classList.add('cart-hidden');
            }
        }
    }
    
    // Make clearTray function global
    window.clearTray = function() {
        cart = [];
        totalPrice = 0;
        localStorage.removeItem('canteenCart');
        localStorage.setItem('totalPrice', '0');
        updateCartDisplay();
    };
});