function transferFunds(senderEmail, recipientGovID, amount) {
    fetch('/data.json')
        .then(response => response.json())
        .then(data => {
            const users = data.users;

            // Debug logs
            console.log('Users:', users);
            console.log('Sender Email:', senderEmail);
            console.log('Recipient Government ID:', recipientGovID);

            // Find the sender and recipient by email and government ID
            const sender = users.find(user => user.email.toLowerCase() === senderEmail.toLowerCase());
            const recipient = users.find(user => user.ssn === recipientGovID);

            // Check if sender and recipient exist
            if (!sender) {
                displayMessage("Sender not found.", 'red');
                return;
            }
            if (!recipient) {
                displayMessage("Recipient not found.", 'red');
                return;
            }

            // Check if sender has enough balance
            if (sender.balance < amount) {
                displayMessage("Insufficient balance.", 'red');
                return;
            }

            // Perform the transaction
            sender.balance -= amount; // Subtract from sender
            recipient.balance += amount; // Add to recipient

            // Display success message
            displayMessage(`Successfully transferred $${amount} to ${recipient.firstName} ${recipient.lastName}.`, 'green');

            // Update the data in the data.json (or save to the database in a real app)
            updateUserData(users); // Update users in the data file or database
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage("Transaction failed. Please try again later.", 'red');
        });
}
