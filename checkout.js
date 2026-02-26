// CHANGE THIS to your Render/Railway link after you deploy the backend
const BASE_URL = "http://localhost:3000"; 

let selectedMethod = ""; 

function selectOnline() {
    selectedMethod = "online";
    document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('online-option').classList.add('selected');
}

function selectCounter() {
    selectedMethod = "counter";
    document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('counter-option').classList.add('selected');
}

async function confirmOrder() {
    const tokenInput = document.getElementById('student-token');
    const btn = document.getElementById('main-btn');
    const totalAmount = localStorage.getItem('totalPrice') || "0";

    if (!tokenInput || !tokenInput.value.trim()) return alert("Please enter Table/Token Number!");
    if (!selectedMethod) return alert("Please select a payment method!");

    btn.innerText = "Sending Order...";
    btn.disabled = true;

    const orderData = {
        customerName: localStorage.getItem('userName') || "Student",
        email: localStorage.getItem('userEmail') || "vpt-student@vpt.edu.in",
        items: JSON.parse(localStorage.getItem('cart')) || [], 
        totalAmount: parseFloat(totalAmount),
        tableNumber: tokenInput.value,
        method: selectedMethod,
        status: "Pending"
    };

    try {
        // Using the BASE_URL for cloud compatibility
        const res = await fetch(`${BASE_URL}/place-order`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            localStorage.removeItem('cart');
            localStorage.setItem('totalPrice', '0');
            
            if (selectedMethod === "online") {
                window.location.href = `upi://pay?pa=canteen@upi&pn=QuickBite&am=${totalAmount}&cu=INR`;
                setTimeout(() => { window.location.href = "success.html"; }, 3000);
            } else {
                window.location.href = "success.html";
            }
        }
    } catch (err) {
        console.error("Order Error:", err);
        alert("Server Error! If you just deployed, wait 1 minute for the server to wake up.");
        btn.innerText = "Confirm & Pay";
        btn.disabled = false;
    }
}

window.onload = () => {
    const total = localStorage.getItem('totalPrice') || "0";
    if(document.getElementById('pay-total')) document.getElementById('pay-total').innerText = total;
};