// This file handles the frontend logic, including user interactions, API calls, and dynamic content updates.

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const patientDataForm = document.getElementById('patient-data-form');
    const notificationsBell = document.getElementById('notifications-bell');
    const searchForm = document.getElementById('search-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(signupForm);
            fetch('/signup', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Signup successful!');
                    window.location.href = '/dashboard';
                } else {
                    alert('Signup failed: ' + data.message);
                }
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(loginForm);
            fetch('/login', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Login successful!');
                    window.location.href = '/dashboard';
                } else {
                    alert('Login failed: ' + data.message);
                }
            });
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('/logout', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Logout successful!');
                    window.location.href = '/';
                }
            });
        });
    }

    if (patientDataForm) {
        patientDataForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(patientDataForm);
            fetch('/patient-data', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Patient data added successfully!');
                    // Optionally refresh the data displayed
                } else {
                    alert('Failed to add patient data: ' + data.message);
                }
            });
        });
    }

    if (notificationsBell) {
        setInterval(() => {
            fetch('/notifications')
            .then(response => response.json())
            .then(data => {
                // Update notifications UI
                notificationsBell.innerHTML = data.notifications.map(notification => `<li>${notification}</li>`).join('');
            });
        }, 5000); // Check for new notifications every 5 seconds
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchQuery = document.getElementById('search-input').value;
            fetch(`/search?query=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(data => {
                // Update the UI with search results
                // Example: display results in a specific section
            });
        });
    }
});