document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission

  // Get the input values
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Fetch the stored user data from data.json
  fetch('/data.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
      })
      .then(data => {
          // Check if the email exists in the stored data
          const user = data.users.find(user => user.email === email);

          if (user) {
              // Compare the password
              if (user.password === password) {
                  const balance = 1000; // Default balance
                  
                          // Store the first and last name in localStorage
                localStorage.setItem('firstName', user.firstName);
                localStorage.setItem('lastName', user.lastName);
                localStorage.setItem('balance', balance);


                  // Redirect to Home page
                  window.location.href = '/home.html'; // Change to your home page URL
              } else {
                  displayMessage('Incorrect password. Please try again.', 'red');
              }
          } else {
              displayMessage('User not found. Please register.', 'red');
          }
      })
      .catch(error => {
          displayMessage('Error fetching user data. Try again later.', 'red');
          console.error('Error:', error);
      });
});

// Function to display messages to the user
function displayMessage(message, color) {
  const messageElement = document.getElementById('loginMessage');
  messageElement.textContent = message;
  messageElement.style.color = color;
}
