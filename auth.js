document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
// Inside your login function, after successful authentication:
const userEmail = document.getElementById('email').value;
const userName = userEmail.split('@')[0]; // Grabs the name part before the @
localStorage.setItem('studentName', userName); 
window.location.href = "menu.html";

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