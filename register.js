document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('registration-form');
    const registerArea = document.getElementById('register-area');
    const successState = document.getElementById('success-state');
    const btnText = document.getElementById('btn-text');

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* ... inside the submit listener ... */
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, rollNo, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success UI logic
                setTimeout(() => {
                    registerArea.classList.add('hidden');
                    successState.classList.remove('hidden');
                    setTimeout(() => { window.location.href = "q_index.html"; }, 2000);
                }, 1000); 
            } else {
                alert(data.message);
                btnText.innerText = "Register Now";
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Cannot connect to server. Make sure it's running!");
            btnText.innerText = "Register Now";
        }

        // 1. Visual Feedback: Change button text
        btnText.innerText = "Creating Account...";

        // 2. Grab values from the form inputs
        const fullName = document.getElementById('full-name').value;
        const rollNo = document.getElementById('roll-no').value;
        const email = document.getElementById('college-email').value;
        const password = document.getElementById('password').value;

        try {
            // 3. Send the data to your Node.js server
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, rollNo, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 4. Success logic: Wait briefly for the "feel" then switch views
                setTimeout(() => {
                    registerArea.classList.add('hidden');
                    successState.classList.remove('hidden');

                    // 5. Final Redirect to login page
                    setTimeout(() => {
                        window.location.href = "q_index.html";
                    }, 2000);
                }, 1000); 
            } else {
                // Handle errors (like email already exists)
                alert(data.message);
                btnText.innerText = "Register Now"; // Reset button if it fails
            }
        } catch (error) {
            // Error if server isn't running
            console.error("Connection Error:", error);
            alert("Server is offline. Start it with 'node q_node.js'");
            btnText.innerText = "Register Now";
            // 2. The Register Route (This receives data from register.js)
app.post('/register', async (req, res) => {
    try {
        const { fullName, rollNo, email, password } = req.body;
        
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        const newUser = new User({ fullName, rollNo, email, password });
        await newUser.save();
        
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error saving user to database." });
    }
});
        }
    });
});