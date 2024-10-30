document.addEventListener("DOMContentLoaded", function () {
    fetchTransactions();

    function fetchTransactions() {
        // Fetch transactions from your API
        fetch('/transactions')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch transactions.');
                }
                return response.json();
            })
            .then(data => {
                const tableBody = document.querySelector('#transactionsTable tbody');
                tableBody.innerHTML = ''; // Clear previous entries

                // Filter for only pending transactions
                const pendingTransactions = data.transactions.filter(transaction => transaction.status === 'pending');

                if (pendingTransactions.length > 0) {
                    pendingTransactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        row.id = `transaction-${transaction.id}`; // Set ID for the row for later reference
                        row.innerHTML = `
                            <td>${transaction.sender_email}</td>
                            <td>${transaction.recipient_ssn}</td>
                            <td>${transaction.amount}</td>
                            <td>${transaction.status}</td>
                            <td>
                                <button onclick="approveTransaction('${transaction.id}')">Approve</button>
                                <button onclick="rejectTransaction('${transaction.id}')">Reject</button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = '<tr><td colspan="5">No pending transactions found.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
                displayMessage('Error fetching transactions. Please try again later.', 'red');
            });
    }

    window.approveTransaction = function (transactionId) {
        updateTransactionStatus(transactionId, 'approved');
    };

    window.rejectTransaction = function (transactionId) {
        updateTransactionStatus(transactionId, 'rejected');
    };

    function updateTransactionStatus(transactionId, status) {
        fetch(`/transactions/${transactionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.message); });
            }
            return response.json();
        })
        .then(data => {
            const message = status === 'approved' 
                ? `Transaction ID: ${transactionId} approved successfully!`
                : `Transaction ID: ${transactionId} rejected successfully!`;
                
            displayMessage(message, 'green'); // Show success message
            moveToLogs(transactionId, status);  // Move transaction to logs
            fetchTransactions(); // Refresh the transaction table after the update
        })
        .catch(error => {
            console.error('Error updating transaction status:', error);
            
            // Improved error handling
            const message = error.message.includes("Insufficient balance")
                ? "Transaction cannot be approved: " + error.message
                : "Error updating transaction status. Please check your network and try again.";
            
            displayMessage(message, 'red');
        });
    }

    // Function to move the transaction to logs
    function moveToLogs(transactionId, status) {
        const row = document.getElementById(`transaction-${transactionId}`);
        if (row) {
            const approvedList = document.getElementById('approvedList');
            const rejectedList = document.getElementById('rejectedList');

            // Create log entry
            const logEntry = document.createElement('li');
            logEntry.textContent = `Transaction ID: ${transactionId}, Amount: ${row.children[2].textContent}, Sender: ${row.children[0].textContent}, Recipient: ${row.children[1].textContent}`;

            // Append log entry to the respective list
            if (status === 'approved') {
                approvedList.appendChild(logEntry);
            } else {
                rejectedList.appendChild(logEntry);
            }

            // Fade out the row before removing it
            function fadeOutRow(row, status) {
                row.classList.add('fade-out');
                if (status === 'approved') {
                    row.style.backgroundColor = '#d4edda'; // Light green for approved
                } else {
                    row.style.backgroundColor = '#f8d7da'; // Light red for rejected
                }
                setTimeout(() => {
                    row.remove();
                }, 1000);
            }
            
            // Call this function in moveToLogs
            fadeOutRow(row, status);
        }
    }

    // Function to display messages to the admin
    function displayMessage(message, color) {
        const messageContainer = document.getElementById('messageContainer') || createMessageContainer();
        
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.color = color;
        messageElement.style.margin = '10px 0';
        
        messageContainer.appendChild(messageElement); // Append to the message container
        
        // Show the message container
        messageContainer.style.display = 'block';

        // Automatically hide the message after a few seconds
        setTimeout(() => {
            messageElement.remove(); // Remove the message element after timeout
            if (messageContainer.children.length === 0) {
                messageContainer.style.display = 'none'; // Hide container if empty
            }
        }, 3000); // Adjust the timeout duration as needed
    }
    
    function createMessageContainer() {
        const container = document.createElement('div');
        container.id = 'messageContainer';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        return container;
    }
});
