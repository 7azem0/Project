document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the input values
    const email = document.getElementById('loginEmail').value;
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

            // Redirect to Home page
            window.location.href = '/home.html'; // Change to your home page URL
        } else {
            displayMessage(data.message, 'red');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage(error.message || 'An error occurred. Please try again.', 'red');
    });
});

// Function to display messages to the user
function displayMessage(message, color) {
    const messageElement = document.getElementById('loginMessage');
    messageElement.textContent = message;
    messageElement.style.color = color;
}
