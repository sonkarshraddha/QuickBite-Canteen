// Knowledge Base for Quickie
const canteenData = {
    specials: "Today's Special is the South Indian Combo (₹60) and Veg Fried Rice (₹70)! 🍛",
    famous: "Our Veg Hakka Noodles are famous across the whole campus for their spicy kick! 🍜",
    mostOrdered: "The most ordered dish this week is the Veg Fried Rice. Students love the extra spring onions!",
    performance: "Dishes are performing great! The Noodles have a 98% satisfaction rate this month.",
    ratings: "Top Rated: 1. South Indian Combo (4.9⭐), 2. Veg Hakka Noodles (4.7⭐), 3. Veg Fried Rice (4.5⭐).",
    hygiene: "We maintain a Grade-A hygiene rating. Our kitchen is sanitized every 4 hours, and all staff wear gloves and hairnets. 🧼",
    ingredients: {
        "south indian combo": "Made with fermented rice batter, urad dal, fresh coconut chutney, and spicy sambar with drumsticks.",
        "noodles": "High-quality wheat noodles, fresh cabbage, carrots, capsicum, and our secret Schezwan sauce.",
        "fried rice": "Long-grain Basmati rice, toasted garlic, beans, carrots, and light soy sauce.",
        "upma": "Roasted semolina (suji), mustard seeds, curry leaves, and crunchy peanuts."
    }
};

function sendMessage() {
    const input = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const val = input.value.toLowerCase().trim();

    if (val === "") return;

    // Display User Message
    addMessage(input.value, 'user-msg');

    // Bot Thinking Logic
    let response = "I'm still learning! Could you try asking about our menu, hygiene, or ratings?";

    if (val.includes("hi") || val.includes("hello")) {
        response = "Hi there! I'm Quickie. Hungry? Ask me about today's specials! 😊";
    } else if (val.includes("how are you")) {
        response = "I'm doing great and smelling some delicious noodles! How can I help you?";
    } else if (val.includes("today's special") || val.includes("today special")) {
        response = canteenData.specials;
    } else if (val.includes("famous")) {
        response = canteenData.famous;
    } else if (val.includes("most ordered") || val.includes("popular")) {
        response = canteenData.mostOrdered;
    } else if (val.includes("performance")) {
        response = canteenData.performance;
    } else if (val.includes("rating") || val.includes("best")) {
        response = canteenData.ratings;
    } else if (val.includes("hygiene") || val.includes("clean")) {
        response = canteenData.hygiene;
    } else if (val.includes("ingredient")) {
        response = "Which dish? I have info on the Combo, Noodles, Fried Rice, and Upma!";
        // Specific ingredient checks
        if (val.includes("combo") || val.includes("dosa")) response = canteenData.ingredients["south indian combo"];
        if (val.includes("noodles")) response = canteenData.ingredients["noodles"];
        if (val.includes("rice")) response = canteenData.ingredients["fried rice"];
        if (val.includes("upma")) response = canteenData.ingredients["upma"];
    }

    // Bot Message with delay
    setTimeout(() => {
        addMessage(response, 'bot-msg');
    }, 500);

    input.value = "";
}

function addMessage(text, className) {
    const chatBody = document.getElementById('chat-body');
    const msg = document.createElement('p');
    msg.className = className;
    msg.innerText = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function toggleChat() {
    console.log("The icon was clicked!"); // This will show in F12 Console
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('chat-hidden');
}