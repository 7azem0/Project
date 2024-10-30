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
            alert(data.message);
            moveToLogs(transactionId, status);  // Move transaction to logs
            fetchTransactions(); // Refresh the transaction table after the update
        })
        .catch(error => {
            console.error('Error updating transaction status:', error);
            
            // Display specific error message if balance is insufficient
            if (error.message.includes("Insufficient balance")) {
                displayMessage("Transaction cannot be approved: " + error.message, 'red');
            } else {
                displayMessage('Error updating transaction status. Please try again later.', 'red');
            }
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
            row.classList.add('fade-out');
            setTimeout(() => {
                row.remove(); // Remove the row from the table
            }, 1000); // Time to wait before removing (should match the CSS transition time)
        }
    }

    // Function to display messages to the admin
    function displayMessage(message, color) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.color = color;
        messageElement.style.margin = '10px 0';
        document.body.prepend(messageElement); // Add to the top of the body
        setTimeout(() => messageElement.remove(), 3000); // Remove message after 3 seconds
    }
});
