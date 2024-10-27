const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Include CORS

const app = express(); // Make sure this line is here

app.use(cors()); // Use CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Registration route
app.post('/register', (req, res) => {
    const newUser = req.body;
    console.log('New registration attempt:', newUser); // Log incoming registration data

    // Ensure all required fields are present
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'address', 'ssn', 'password', 'securityQuestion', 'securityAnswer'];
    for (const field of requiredFields) {
        if (!newUser[field]) {
            return res.status(400).json({ message: `${field} is required.` });
        }
    }

    // Check if request body is empty
    if (!newUser || Object.keys(newUser).length === 0) {
        return res.status(400).json({ message: 'No data provided.' });
    }

    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
            // If data.json doesn't exist, create a new file with the first user
            console.log('data.json not found, creating a new one...');
            const users = [newUser];
            return fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify({ users }, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to data.json:', writeErr);
                    return res.status(500).json({ message: 'Error writing to data.json' });
                }
                res.status(200).json({ message: 'Registration successful!' });
            });
        } else if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).json({ message: 'Error reading data.json' });
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing data.json:', parseErr);
            return res.status(500).json({ message: 'Error processing data file.' });
        }

        let users = jsonData.users || [];
        const userExists = users.some(user => user.email === newUser.email);

        if (userExists) {
            console.log('User already exists:', newUser.email);
            return res.status(400).json({ message: 'User already exists' });
        }

        users.push(newUser);

        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify({ users }, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to data.json:', writeErr);
                return res.status(500).json({ message: 'Error writing to data.json' });
            }
            console.log('User registered successfully:', newUser.email);
            res.status(200).json({ message: 'Registration successful!' ,
                "success" : true
            });
        });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); // Log login attempt

    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).json({ message: 'Error fetching user data. Try again later.' });
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing data.json:', parseError);
            return res.status(500).json({ message: 'Error fetching user data. Try again later.' });
        }

        let users = jsonData.users || [];
        const user = users.find(user => user.email === email);

        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'User not found. Please register.' });
        }

        if (user.password !== password) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ message: 'Incorrect password. Please try again.' });
        }

        console.log('Login successful for user:', email);
        return res.status(200).json({ message: 'Login successful!' });
    });
});

// Serve static files like the registration and login pages
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve data.json
app.get('/data.json', (req, res) => {
    const dataPath = path.join(__dirname, 'data.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            res.status(500).send('Error reading data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
