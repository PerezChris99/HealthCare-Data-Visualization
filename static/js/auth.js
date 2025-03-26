document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authControls = document.getElementById('auth-controls');
    const userControls = document.getElementById('user-controls');
    const userWelcome = document.getElementById('user-welcome');
    const doctorDashboard = document.getElementById('doctor-dashboard');
    const patientDashboard = document.getElementById('patient-dashboard');
    const registerRole = document.getElementById('register-role');
    const medicalHistoryGroup = document.getElementById('medical-history-group');

    // Check if user is logged in
    checkAuth();

    // Show login form
    loginButton.addEventListener('click', () => {
        loginSection.classList.remove('hidden');
        registerSection.classList.add('hidden');
    });

    // Show register form
    registerButton.addEventListener('click', () => {
        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
    });

    // Handle medical history field visibility
    registerRole.addEventListener('change', () => {
        if (registerRole.value === 'patient') {
            medicalHistoryGroup.style.display = 'block';
        } else {
            medicalHistoryGroup.style.display = 'none';
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                showDashboard(data.role);
            } else {
                alert('Login failed: ' + data.msg);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    });

    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const name = document.getElementById('register-name').value;
        const age = document.getElementById('register-age').value;
        const role = document.getElementById('register-role').value;
        const medicalHistory = document.getElementById('register-medical-history').value;

        const userData = {
            email,
            password,
            role,
            name,
            age: parseInt(age)
        };

        if (role === 'patient') {
            userData.medical_history = medicalHistory;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please log in.');
                loginSection.classList.remove('hidden');
                registerSection.classList.add('hidden');
                registerForm.reset();
            } else {
                alert('Registration failed: ' + data.msg);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred during registration.');
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('patientId');
        checkAuth();
    });

    // Check authentication status and show appropriate dashboard
    function checkAuth() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token) {
            // User is logged in
            authControls.classList.add('hidden');
            userControls.classList.remove('hidden');
            loginSection.classList.add('hidden');
            registerSection.classList.add('hidden');

            showDashboard(role);
        } else {
            // User is not logged in
            authControls.classList.remove('hidden');
            userControls.classList.add('hidden');
            doctorDashboard.classList.add('hidden');
            patientDashboard.classList.add('hidden');
            loginSection.classList.remove('hidden');
        }
    }

    // Show appropriate dashboard based on role
    function showDashboard(role) {
        if (role === 'doctor') {
            userWelcome.textContent = 'Welcome, Doctor';
            doctorDashboard.classList.remove('hidden');
            patientDashboard.classList.add('hidden');
            loadPatients();
        } else if (role === 'patient') {
            userWelcome.textContent = 'Welcome, Patient';
            patientDashboard.classList.remove('hidden');
            doctorDashboard.classList.add('hidden');
            loadPatientProfile();
        }
    }

    // Load patient profile for patient dashboard
    async function loadPatientProfile() {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const patientData = await response.json();
                document.getElementById('patient-own-name').textContent = patientData.name;
                document.getElementById('patient-own-age').textContent = patientData.age;
                document.getElementById('patient-own-medical-history').textContent = patientData.medical_history || 'None';
                
                // Store patient ID for later use
                localStorage.setItem('patientId', patientData.id);
                
                // Load patient metrics
                loadPatientMetrics(patientData.id);
            } else {
                console.error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
});
