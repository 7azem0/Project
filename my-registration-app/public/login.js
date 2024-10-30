document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the input values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const messageElement = document.getElementById('loginMessage');
    messageElement.innerHTML = ''; // Clear previous messages

    // Create login object
    const loginData = {
        email,
        password
    };

    // Send login data to server
    fetch('/login', { // Ensure this matches your server's login endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Assuming the server sends back first name, last name, and balance
            localStorage.setItem('first_name', data.user.first_name); // Updated to match schema
            localStorage.setItem('last_name', data.user.last_name); // Updated to match schema
            localStorage.setItem('balance', data.user.balance); // Assuming balance is part of the user object
            localStorage.setItem('email', email); // Store user's email when they log in

            // Redirect based on user type
            if (email === "Admin@gmail.com") {
                // Open admin page in a new tab
                window.open("admin.html", "_blank");
            } else {
                // Redirect to Home page
                window.location.href = '/home.html'; // Change to your home page URL
            }
        } else {
            displayMessage(data.message, 'red');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage(error.message || 'An error occurred. Please try again.', 'red');
    });
});

// Function to display messages to the user with animation
function displayMessage(message, color) {
    const messageElement = document.getElementById('loginMessage');
    messageElement.textContent = message;
    messageElement.style.color = color;

    // Animation effect for message display
    messageElement.classList.add('slide-in');
    setTimeout(() => {
        messageElement.classList.remove('slide-in');
    }, 3000); // Keep the message for 3 seconds
}

// CSS Animation for message (to be added in your CSS file)
document.addEventListener("DOMContentLoaded", function() {
    const style = document.createElement('style');
    style.innerHTML = `
        #loginMessage {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        #loginMessage.slide-in {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});
