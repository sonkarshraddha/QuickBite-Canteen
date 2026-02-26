let cartCount = 0;
let totalPrice = 0;

const cartBar = document.getElementById('cart-bar');
const cartCountDisplay = document.getElementById('cart-count');
const totalPriceDisplay = document.getElementById('total-price');

// Select all "Add +" buttons
const addButtons = document.querySelectorAll('.add-btn');

addButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 1. Get the price from the card (removes the '₹' symbol)
        const priceText = button.parentElement.querySelector('.price').innerText;
        const price = parseInt(priceText.replace('₹', ''));

        // 2. Update logic
        cartCount++;
        totalPrice += price;

        // 3. Update the display
        cartCountDisplay.innerText = cartCount;
        totalPriceDisplay.innerText = totalPrice;

        // 4. Show the cart bar if it's hidden
        if (cartCount > 0) {
            cartBar.classList.remove('cart-hidden');
        }

        // Optional: Animation feedback on the button
        button.innerText = "Added!";
        button.style.backgroundColor = "#2ecc71";
        setTimeout(() => {
            button.innerText = "Add +";
            button.style.backgroundColor = "#d63031";
        }, 800);
    });
});

// ... existing variables (cartCount, totalPrice) ...

// Select the checkout button
const checkoutBtn = document.querySelector('.checkout-btn');

checkoutBtn.addEventListener('click', () => {
    // 1. Save current cart data so the next page can read it
    localStorage.setItem('cartCount', cartCount);
    localStorage.setItem('totalPrice', totalPrice);

    // 2. Redirect to the checkout page
    window.location.href = "checkout.html";
});

// Update your existing addButtons loop to ensure data is saved immediately
addButtons.forEach(button => {
    button.addEventListener('click', () => {
        // ... your existing price extraction and display logic ...
        
        // Optional: Save progress in case of page refresh
        localStorage.setItem('cartCount', cartCount);
        localStorage.setItem('totalPrice', totalPrice);
    });
});

