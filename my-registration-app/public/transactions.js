document.getElementById("transferForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const recipientGovID = document.getElementById("recipientGovID").value.trim();
    const transferAmount = parseFloat(document.getElementById("transferAmount").value.trim());

    // Validate inputs
    if (!recipientGovID || !/^[0-9]+$/.test(recipientGovID)) {
        displayMessage("Please enter a valid recipient ID (only integers).", 'red');
        return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
        displayMessage("Please enter a valid transfer amount greater than zero.", 'red');
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
            document.getElementById("transferForm").reset();
        }
    })
    
.catch(error => {
    console.error('Transaction Error:', error); // Server log
    displayMessage("Something went wrong. Please try again later.", 'red'); // User-friendly message
});
});

// Display message function
function displayMessage(message, color) {
    const messageElement = document.getElementById("transactionMessage");
    messageElement.textContent = message;
    messageElement.style.color = color;

    messageElement.classList.remove('message', 'shake');

    void messageElement.offsetWidth; // This forces a reflow

    messageElement.classList.add('message');

    if (messageElement.textContent === message) {
        messageElement.classList.add('shake');
    }

    setTimeout(() => {
        messageElement.classList.remove('shake');
    }, 500); // Duration should match the shake animation duration
}



document.getElementById("homeButton").addEventListener("click", function() {
    window.location.href = "home.html"; // Replace with the actual path to your home page
});
