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

    const requiredFields = ['first_name', 'middel_name', 'last_name', 'email', 'phone', 'dob', 'address', 'ssn', 'password', 'account_type', 'security_question', 'security_answer'];
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

            if (sender.balance < amount) {
                return res.status(400).json({ success: false, message: "Insufficient balance." });
            }

            // Perform the transaction
            const updatedSenderBalance = sender.balance - amount;
            const updatedRecipientBalance = recipient.balance + amount;

            // Update balances in the database
            db.query('UPDATE users SET balance = ? WHERE email = ?', [updatedSenderBalance, senderEmail], (error) => {
                if (error) {
                    return res.status(500).json({ message: 'Error updating sender balance.' });
                }

                db.query('UPDATE users SET balance = ? WHERE ssn = ?', [updatedRecipientBalance, recipientGovID], (error) => {
                    if (error) {
                        return res.status(500).json({ message: 'Error updating recipient balance.' });
                    }

                    res.json({ success: true, message: `Successfully transferred $${amount} to ${recipient.first_name} ${recipient.last_name}.` });
                });
            });
        });
    });
});

// Serve static files like the registration and login pages
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
