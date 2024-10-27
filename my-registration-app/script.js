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
    
    // Form validation
    if (!firstName || !lastName || !email || !phone || !dob || !address || !ssn || !password || !securityQuestion || !securityAnswer) {
        message.innerHTML = "All fields are required.";
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
        securityAnswer
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
                    window.location.href = '/login.html';  // Redirect to the login page after 1.5 seconds
                }, 500);  // .5 seconds delay
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        message.innerHTML = "An error occurred. Please try again.";
        message.style.color = 'red';
    });
});
