document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ ONLY redirect if the server says "Login Successful"
            alert("Login successful! Welcome to QuickBite.");
            window.location.href = "menu.html"; 
        } else {
            // ❌ Show the specific error (e.g., "Incorrect password")
            alert("Login failed: " + data.message);
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Server is offline! Make sure to run 'node q_node.js' in your terminal.");
    }
});