document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    // Get form values
    const first_name = document.getElementById('first_name').value.trim();
    const middle_name = document.getElementById('middle_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const address = document.getElementById('address').value.trim();
    const ssn = document.getElementById('ssn').value.trim();
    const password = document.getElementById('password').value.trim();
    const account_type = document.getElementById('account_type').value.trim();
    const security_question = document.getElementById('security_question').value.trim();
    const security_answer = document.getElementById('security_answer').value.trim();

    const message = document.getElementById('message');
    message.innerHTML = ''; // Clear previous messages

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;  // Assuming 10-digit phone number
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;  // Minimum 8 characters, at least 1 letter and 1 number

    // Form validation
    if (!first_name || !last_name || !email || !phone || !dob || !address || !ssn || !password || !account_type || !security_question || !security_answer) {
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
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        dob,
        address,
        ssn,
        password,
        account_type,
        security_question,
        security_answer
    };

    // Disable the submit button to prevent multiple submissions
    const submitButton = document.getElementById('submitButton');

    // Send data to server
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
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
        message.innerHTML = data.message;
        message.style.color = data.success ? 'green' : 'red';

        // If registration is successful, redirect to login page
        if (data.success) {
            setTimeout(() => {
                window.location.href = '/login.html';  
            }, 2000);  // Delay to show success message before redirect
        }
    })
    .catch(error => {
        console.error('Error:', error);
        message.innerHTML = error.message || "An error occurred. Please try again.";
        message.style.color = 'red';
    })
    .finally(() => {
        // Re-enable the submit button
    });
});
