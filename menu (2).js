// Connect to your live Render backend
const BASE_URL = "https://quickbite-canteen.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems();
});

// 1. Fetch items from the Cloud Database
async function fetchMenuItems() {
    try {
        const response = await fetch(`${BASE_URL}/api/menu`);
        const items = await response.json();
        displayMenu(items);
    } catch (err) {
        console.error("Error loading menu:", err);
    }
}

// 2. Display the items in your grid
function displayMenu(items) {
    const menuGrid = document.querySelector('.menu-grid') || document.querySelector('.menu-container');
    menuGrid.innerHTML = items.map(item => `
        <div class="item-card">
            <img src="${item.image || 'default-food.jpg'}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <div class="price-row">
                    <span class="price">₹${item.price}</span>
                    <button class="add-btn" onclick="addToTray('${item._id}', '${item.name}', ${item.price})">
                        Add +
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Logic for the Tray
function addToTray(id, name, price) {
    let tray = JSON.parse(localStorage.getItem('tray')) || [];
    tray.push({ id, name, price });
    localStorage.setItem('tray', JSON.stringify(tray));
    
    // Alert the user or update tray count
    const trayBtn = document.querySelector('.view-tray');
    if(trayBtn) trayBtn.innerText = `View Tray (${tray.length})`;
}