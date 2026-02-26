let cart = [];

function addToCart(itemName, price) {
    // 1. Add item to the local array
    cart.push(itemName);
    
    // 2. Calculate current total
    let currentTotal = parseFloat(localStorage.getItem('totalPrice')) || 0;
    currentTotal += price;

    // 3. THE BRIDGE: Save to localStorage so Checkout can see it
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('totalPrice', currentTotal.toString());

    // Optional: Visual feedback
    alert(itemName + " added to tray! Total: ₹" + currentTotal);
}

// Function to clear tray (call this when they start over)
function clearTray() {
    cart = [];
    localStorage.removeItem('cart');
    localStorage.setItem('totalPrice', '0');
}