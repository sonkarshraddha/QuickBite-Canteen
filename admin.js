// CHANGE THIS to your Render/Railway link after you deploy the backend
const BASE_URL = "http://localhost:3000"; 

function checkAccess() {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
        document.getElementById('admin-content').style.display = 'block';
        loadData();
    } else {
        const pass = prompt("Enter Admin Password:");
        if (pass === "admin123") {
            sessionStorage.setItem('adminAuth', 'true');
            document.getElementById('admin-content').style.display = 'block';
            loadData();
        } else {
            alert("Unauthorized!");
            window.location.href = "menu.html";
        }
    }
}

async function loadData() {
    try {
        const response = await fetch(`${BASE_URL}/get-orders`);
        const orders = await response.json();

        const activeTable = document.getElementById('active-orders');
        const paymentTable = document.getElementById('payment-logs');
        
        let revenue = 0;
        let pendingCount = 0;
        
        activeTable.innerHTML = "";
        paymentTable.innerHTML = "";

        orders.forEach((order) => {
            const amount = parseFloat(order.totalAmount || 0);
            revenue += amount;

            // FIX: Joins items correctly so the column is not blank
            const itemsText = (order.items && order.items.length > 0) 
                ? order.items.map(i => (typeof i === 'object' ? i.name : i)).join(", ") 
                : "Standard Meal";

            if (order.status === "Pending") {
                pendingCount++;
                activeTable.innerHTML += `
                    <tr>
                        <td><b>#${order.tableNumber || "0"}</b></td>
                        <td>${itemsText}</td> 
                        <td>${new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td><button class="ready-btn" onclick="markReady('${order._id}')">Ready ✔</button></td>
                    </tr>`;
            }

            const isOnline = (order.method === 'online');
            paymentTable.innerHTML += `
                <tr>
                    <td>#${order.tableNumber || "0"}</td>
                    <td>₹${amount}</td>
                    <td><span class="method-tag ${isOnline ? 'upi' : 'cash'}">${isOnline ? '📱 UPI' : '💵 CASH'}</span></td>
                    <td>${new Date(order.orderDate).toLocaleTimeString()}</td>
                </tr>`;
        });

        document.getElementById('stat-count').innerText = pendingCount;
        document.getElementById('stat-revenue').innerText = "₹" + revenue;

    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

async function markReady(orderId) {
    // You will need to add an update route in q_node.js for this to fully work
    loadData();
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    window.location.reload();
}

checkAccess();
setInterval(loadData, 5000);