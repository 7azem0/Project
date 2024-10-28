document.getElementById("transferForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get the input values
    const recipientGovID = document.getElementById("ssn").value.trim();
    const transferAmount = parseFloat(document.getElementById("transferAmount").value);

    // Validate inputs
    if (!recipientGovID || isNaN(transferAmount) || transferAmount <= 0) {
        displayMessage("Please enter a valid recipient ID and transfer amount.", 'red');
        return;
    }

    // Assuming the sender's email is stored in localStorage
    const senderEmail = localStorage.getItem("email"); 

    // Call the transferFunds function with the collected data
    transferFunds(senderEmail, recipientGovID, transferAmount);
});

// Updated transferFunds function to communicate with the server
function transferFunds(senderEmail, recipientGovID, amount) {
    // Create transfer object
    const transferData = {
        senderEmail,
        ssn: recipientGovID,
        amount: transferAmount // Use 'amount' to match the server schema
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
        // Display the message from the server response
        displayMessage(data.message, data.success ? 'green' : 'red');
        
        if (data.success) {
            // Optionally reset the form or perform any other actions on success
            document.getElementById("transferForm").reset();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage("Transaction failed. Please try again later.", 'red');
    });
}

// Display message function
function displayMessage(message, color) {
    const messageElement = document.getElementById("transactionMessage");
    messageElement.textContent = message;
    messageElement.style.color = color;
}
