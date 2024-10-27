document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const address = document.getElementById('address').value.trim();
    const ssn = document.getElementById('ssn').value.trim();
    const password = document.getElementById('password').value.trim();
    const securityQuestion = document.getElementById('securityQuestion').value;
    const securityAnswer = document.getElementById('securityAnswer').value.trim();

    const message = document.getElementById('message');
    message.innerHTML = ''; // Clear previous messages

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;  // Assuming 10-digit phone number
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;  // Minimum 8 characters, at least 1 letter and 1 number

    // Form validation
    if (!firstName || !lastName || !email || !phone || !dob || !address || !ssn || !password || !securityQuestion || !securityAnswer) {
        message.innerHTML = "All fields are required.";
        message.style.color = 'red';
        return;
    }

    // Email validation
    if (!emailPattern.test(email)) {
        message.innerHTML = "Please enter a valid email address.";
        message.style.color = 'red';
        return;
    }

    // Phone validation
    if (!phonePattern.test(phone)) {
        message.innerHTML = "Please enter a valid 10-digit phone number.";
        message.style.color = 'red';
        return;
    }

    // Password validation
    if (!passwordPattern.test(password)) {
        message.innerHTML = "Password must be at least 8 characters long and contain at least one letter and one number.";
        message.style.color = 'red';
        return;
    }

    // Create user object
    const userData = {
        firstName,
        lastName,
        email,
        phone,
        dob,
        address,
        ssn,
        password,
        securityQuestion,
        securityAnswer,
        balance:1000
    };

    // Send data to server
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            message.innerHTML = data.message;
            message.style.color = data.success ? 'green' : 'red';

            // If registration is successful, redirect to login page
            if (data.success) {
                setTimeout(() => {
                    window.location.href = '/login.html';  
                }, 2000);  // Delay to show success message before redirect
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        message.innerHTML = "An error occurred. Please try again.";
        message.style.color = 'red';
    });
});
