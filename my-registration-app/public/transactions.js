document.getElementById("transferForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get the input values
    const recipientGovID = document.getElementById("recipientGovID").value.trim();
    const transferAmount = parseFloat(document.getElementById("transferAmount").value);

    // Validate inputs
    if (!recipientGovID || isNaN(transferAmount) || transferAmount <= 0) {
        displayMessage("Please enter a valid recipient ID and transfer amount.", 'red');
        return;
    }

    // Assuming the sender's email is stored in localStorage
    const senderEmail = localStorage.getItem("email");

    // Create transfer object
    const transferData = {
        senderEmail,
        recipientGovID,
        amount: transferAmount // Updated key to match schema
    };

    // Send transfer data to the server
    fetch('/transfer', { // Ensure this matches your server's transfer endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
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
        displayMessage(data.message, data.success ? 'green' : 'red');
        if (data.success) {
            // Optionally clear the form or redirect
            document.getElementById("transferForm").reset();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage(error.message || 'An error occurred. Please try again.', 'red');
    });
});

// Display message function
function displayMessage(message, color) {
    const messageElement = document.getElementById("transactionMessage");
    messageElement.textContent = message;
    messageElement.style.color = color;
}

document.getElementById("homeButton").addEventListener("click", function() {
    window.location.href = "home.html"; // Replace with the actual path to your home page
});