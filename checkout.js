const BASE_URL = "http://localhost:3000"; // Change to your Render URL when deployed

let selectedMethod = "";

// Make these functions global
window.selectOnline = function() {
    selectedMethod = "online";
    document.getElementById('online-option').classList.add('selected');
    document.getElementById('counter-option').classList.remove('selected');
};

window.selectCounter = function() {
    selectedMethod = "counter";
    document.getElementById('counter-option').classList.add('selected');
    document.getElementById('online-option').classList.remove('selected');
};

window.confirmOrder = async function() {
    const tokenInput = document.getElementById('student-token');
    const btn = document.getElementById('main-btn');
    
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('canteenCart')) || [];
    const totalAmount = parseFloat(localStorage.getItem('totalPrice')) || 0;

    if (!tokenInput || !tokenInput.value.trim()) {
        alert("Please enter Table/Token Number!");
        return;
    }
    if (!selectedMethod) {
        alert("Please select a payment method!");
        return;
    }
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    btn.innerText = "Sending Order...";
    btn.disabled = true;

    const orderData = {
        customerName: localStorage.getItem('userName') || "Student",
        email: localStorage.getItem('userEmail') || "student@college.edu",
        items: cart,
        totalAmount: totalAmount,
        tableNumber: tokenInput.value,
        method: selectedMethod,
        status: "Pending"
    };

    try {
        const res = await fetch(`${BASE_URL}/place-order`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            // Save token for success page
            localStorage.setItem('customToken', tokenInput.value);
            localStorage.setItem('payMethod', selectedMethod);
            
            if (selectedMethod === "online") {
                // Simulate UPI payment (in real app, redirect to UPI app)
                alert("Redirecting to UPI app...");
                setTimeout(() => { 
                    window.location.href = "success.html"; 
                }, 2000);
            } else {
                window.location.href = "success.html";
            }
        } else {
            throw new Error('Order failed');
        }
    } catch (err) {
        console.error("Order Error:", err);
        alert("Server Error! Make sure the backend is running.");
        btn.innerText = "Confirm & Pay";
        btn.disabled = false;
    }
};

// Load total on page load
window.onload = function() {
    const total = localStorage.getItem('totalPrice') || "0";
    const totalElement = document.getElementById('pay-total');
    if (totalElement) totalElement.innerText = total;
};