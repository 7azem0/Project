const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'NEPH', // replace with your MySQL password
    database: 'banking_app' // the name of your database
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Registration route
app.post('/register', (req, res) => {
    const newUser = req.body;
    console.log('New registration attempt:', newUser); // Log incoming registration data

    const requiredFields = ['first_name', 'middle_name', 'last_name', 'email', 'phone', 'dob', 'address', 'ssn', 'password', 'account_type', 'security_question', 'security_answer'];
    for (const field of requiredFields) {
        if (!newUser[field]) {
            return res.status(400).json({ message: `${field} is required.` });
        }
    }

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [newUser.email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            console.log('User already exists:', newUser.email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert the new user into the database
        const userWithBalance = { ...newUser, balance: 1000 };
        db.query('INSERT INTO users SET ?', userWithBalance, (insertError) => {
            if (insertError) {
                console.error('Error inserting user:', insertError);
                return res.status(500).json({ message: 'Error registering user' });
            }
            console.log('User registered successfully:', newUser.email);
            res.status(200).json({ message: 'Registration successful!', success: true });
        });
    });
});

// Get user balance route
app.post('/getBalance', (req, res) => {
    const { email } = req.body;

    // Fetch user balance from the database
    db.query('SELECT balance FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Assuming there's only one user with the email
        const user = results[0];
        res.json({ success: true, balance: user.balance });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error fetching user data. Try again later.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found. Please register.' });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(400).json({ message: 'Incorrect password. Please try again.' });
        }

        // Return user information along with balance
        return res.json({ success: true, user: { first_name: user.first_name, last_name: user.last_name, balance: user.balance } });
    });
});

// Transfer funds route
app.post('/transfer', (req, res) => {
    const { senderEmail, recipientGovID, amount } = req.body;
    console.log('Transfer amount:', amount);

    if (!senderEmail || !recipientGovID || !amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid input data." });
    }

    // Fetch sender and recipient details
    db.query('SELECT * FROM users WHERE email = ?', [senderEmail], (error, senderResults) => {
        if (error) {
            return res.status(500).json({ message: 'Error fetching user data. Try again later.' });
        }

        if (senderResults.length === 0) {
            return res.status(404).json({ success: false, message: "Sender not found." });
        }

        const sender = senderResults[0];

        db.query('SELECT * FROM users WHERE ssn = ?', [recipientGovID], (error, recipientResults) => {
            if (error) {
                return res.status(500).json({ message: 'Error fetching user data. Try again later.' });
            }

            if (recipientResults.length === 0) {
                return res.status(404).json({ success: false, message: "Recipient not found." });
            }

            const recipient = recipientResults[0];

            console.log('Recipient initial balance:', recipient.balance);

            if (sender.balance < amount) {
                return res.status(400).json({ success: false, message: "Insufficient balance." });
            }

            // Insert the transaction into the transactions table with a status of 'pending'
            const transaction = {
                sender_email: senderEmail,
                recipient_ssn: recipientGovID,
                amount: amount,
                status: 'pending'
            };

            db.query('INSERT INTO transactions SET ?', transaction, (insertError) => {
                if (insertError) {
                    console.error('Error inserting transaction:', insertError);
                    return res.status(500).json({ message: 'Error processing transaction.' });
                }

                console.log('Transaction created successfully:', transaction);
                res.json({
                    success: true,
                    message: `Transaction of $${amount} to ${recipient.first_name} ${recipient.last_name} is pending approval.`,
                });
            });
        });
    });
});

// Admin route to get all transactions
app.get('/transactions', (req, res) => {
    db.query('SELECT * FROM transactions', (error, results) => {
        if (error) {
            console.error('Error fetching transactions:', error);
            return res.status(500).json({ message: 'Database error' });
        }
        
        console.log('Transactions fetched:', results); // Debugging line

        res.json({ success: true, transactions: results });
    });
});


app.patch('/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Status can be 'approved' or 'rejected'

    db.query('SELECT * FROM transactions WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error fetching transaction:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        const transaction = results[0];

        if (status === 'approved') {
            // Logic for approving the transaction
            db.query('SELECT * FROM users WHERE email = ?', [transaction.sender_email], (error, senderResults) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching sender data.' });
                }

                const sender = senderResults[0];

                db.query('SELECT * FROM users WHERE ssn = ?', [transaction.recipient_ssn], (error, recipientResults) => {
                    if (error) {
                        return res.status(500).json({ message: 'Error fetching recipient data.' });
                    }

                    const recipient = recipientResults[0];

                    if (sender.balance < transaction.amount) {
                        return res.status(400).json({ message: "Insufficient balance to approve this transaction." });
                    }

                    // Update sender's and recipient's balance
                    const updatedSenderBalance = Math.round((sender.balance - transaction.amount) * 100) / 100;
                    const updatedRecipientBalance = parseFloat(recipient.balance) + parseFloat(transaction.amount);

                    db.query('UPDATE users SET balance = ? WHERE email = ?', [updatedSenderBalance, transaction.sender_email], (error) => {
                        if (error) {
                            return res.status(500).json({ message: 'Error updating sender balance.' });
                        }

                        db.query('UPDATE users SET balance = ? WHERE ssn = ?', [updatedRecipientBalance, transaction.recipient_ssn], (error) => {
                            if (error) {
                                return res.status(500).json({ message: 'Error updating recipient balance.' });
                            }

                            // Update transaction status
                            db.query('UPDATE transactions SET status = ? WHERE id = ?', ['approved', id], (error) => {
                                if (error) {
                                    return res.status(500).json({ message: 'Error updating transaction status.' });
                                }

                                res.json({
                                    success: true,
                                    message: `Transaction approved successfully. $${transaction.amount} transferred from ${sender.first_name} ${sender.last_name} to ${recipient.first_name} ${recipient.last_name}.`,
                                });
                            });
                        });
                    });
                });
            });
        } else if (status === 'rejected') {
            // Update transaction status to rejected
            db.query('UPDATE transactions SET status = ? WHERE id = ?', ['rejected', id], (error) => {
                if (error) {
                    return res.status(500).json({ message: 'Error updating transaction status.' });
                }

                res.json({ success: true, message: 'Transaction rejected successfully.' });
            });
        } else {
            res.status(400).json({ message: 'Invalid action. Please specify "approve" or "reject."' });
        }
    });
});

// Serve static files like the registration and login pages
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
