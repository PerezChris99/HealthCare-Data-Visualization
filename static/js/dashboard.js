document.addEventListener('DOMContentLoaded', () => {
    // Variables to store selected patient and data
    let selectedPatient = null;
    let patientMetrics = {};

    // DOM elements - Doctor Dashboard
    const patientList = document.getElementById('patient-list');
    const patientDetails = document.getElementById('patient-details');
    const patientNameHeader = document.getElementById('patient-name-header');
    const patientAge = document.getElementById('patient-age');
    const patientMedicalHistory = document.getElementById('patient-medical-history');
    const metricTypeSelector = document.getElementById('metric-type-selector');
    const patientSearch = document.getElementById('patient-search');
    const addMetricForm = document.getElementById('add-metric-form');

    // DOM elements - Patient Dashboard
    const patientMetricTypeSelector = document.getElementById('patient-metric-type-selector');
    const patientAddMetricForm = document.getElementById('patient-add-metric-form');

    // DOM elements - Loading and Animations
    const loading = document.querySelector('.loading');
    const dashboardLink = document.getElementById('dashboard-link');
    const profileLink = document.getElementById('profile-link');
    const dashboardSection = document.getElementById('dashboard');
    const profileSection = document.getElementById('profile');

    // Event listeners
    if (metricTypeSelector) {
        metricTypeSelector.addEventListener('change', updateMetricChart);
    }
    
    if (patientMetricTypeSelector) {
        patientMetricTypeSelector.addEventListener('change', updatePatientMetricChart);
    }
    
    if (patientSearch) {
        patientSearch.addEventListener('input', filterPatients);
    }
    
    if (addMetricForm) {
        addMetricForm.addEventListener('submit', addMetric);
    }
    
    if (patientAddMetricForm) {
        patientAddMetricForm.addEventListener('submit', addPatientMetric);
    }

    // Show loading when fetching data
    async function fetchHealthData() {
        showLoading();
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        hideLoading();
    }

    // Simulate loading state
    function showLoading() {
        loading.classList.remove('hidden');
    }
    
    function hideLoading() {
        loading.classList.add('hidden');
    }

    // Handle tab switching
    dashboardLink.addEventListener('click', () => {
        profileSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        fetchHealthData();
    });
    
    profileLink.addEventListener('click', () => {
        dashboardSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
    });

    // Initial load
    fetchHealthData();

    // Load patients for doctor dashboard
    window.loadPatients = async function() {
        if (localStorage.getItem('role') !== 'doctor') return;
        
        try {
            const response = await fetch('/api/patients', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const patients = await response.json();
                renderPatientList(patients);
            } else {
                console.error('Failed to load patients');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    };

    // Render patient list in doctor dashboard
    function renderPatientList(patients) {
        patientList.innerHTML = '';
        
        patients.forEach(patient => {
            const li = document.createElement('li');
            li.textContent = patient.name;
            li.dataset.patientId = patient.id;
            li.addEventListener('click', () => selectPatient(patient));
            patientList.appendChild(li);
        });
    }

    // Filter patients based on search input
    function filterPatients() {
        const searchTerm = patientSearch.value.toLowerCase();
        const patientItems = patientList.querySelectorAll('li');
        
        patientItems.forEach(item => {
            if (item.textContent.toLowerCase().includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Select patient and display their details
    function selectPatient(patient) {
        selectedPatient = patient;
        
        // Update UI to show selected patient
        const patientItems = patientList.querySelectorAll('li');
        patientItems.forEach(item => {
            if (parseInt(item.dataset.patientId) === patient.id) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Display patient details
        patientNameHeader.textContent = patient.name;
        patientAge.textContent = patient.age;
        patientMedicalHistory.textContent = patient.medical_history || 'None';
        
        // Show patient details section
        patientDetails.classList.remove('hidden');
        
        // Load patient metrics
        loadPatientMetrics(patient.id);
    }

    // Load health metrics for a patient
    window.loadPatientMetrics = async function(patientId) {
        try {
            const response = await fetch(`/api/patients/${patientId}/metrics`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const metrics = await response.json();
                
                // Group metrics by type
                patientMetrics = {};
                metrics.forEach(metric => {
                    if (!patientMetrics[metric.type]) {
                        patientMetrics[metric.type] = [];
                    }
                    patientMetrics[metric.type].push({
                        value: metric.value,
                        timestamp: new Date(metric.timestamp)
                    });
                });
                
                // Update chart based on selected metric type
                const role = localStorage.getItem('role');
                if (role === 'doctor') {
                    updateMetricChart();
                } else if (role === 'patient') {
                    updatePatientMetricChart();
                }
            } else {
                console.error('Failed to load patient metrics');
            }
        } catch (error) {
            console.error('Error loading patient metrics:', error);
        }
    };

    // Update chart for doctor view
    function updateMetricChart() {
        const metricType = metricTypeSelector.value;
        const metricsData = patientMetrics[metricType] || [];
        
        // Sort by timestamp
        metricsData.sort((a, b) => a.timestamp - b.timestamp);
        
        renderMetricChart(
            'metrics-chart',
            metricType,
            metricsData.map(m => m.timestamp),
            metricsData.map(m => m.value)
        );
    }

    // Update chart for patient view
    function updatePatientMetricChart() {
        const metricType = patientMetricTypeSelector.value;
        const metricsData = patientMetrics[metricType] || [];
        
        // Sort by timestamp
        metricsData.sort((a, b) => a.timestamp - b.timestamp);
        
        renderMetricChart(
            'patient-metrics-chart',
            metricType,
            metricsData.map(m => m.timestamp),
            metricsData.map(m => m.value)
        );
    }

    // Add new metric (doctor view)
    async function addMetric(e) {
        e.preventDefault();
        
        if (!selectedPatient) {
            alert('Please select a patient first.');
            return;
        }
        
        const metricType = document.getElementById('new-metric-type').value;
        const metricValue = document.getElementById('new-metric-value').value;
        
        try {
            const response = await fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    patient_id: selectedPatient.id,
                    type: metricType,
                    value: parseFloat(metricValue)
                })
            });
            
            if (response.ok) {
                alert('Metric added successfully!');
                addMetricForm.reset();
                loadPatientMetrics(selectedPatient.id);
            } else {
                const data = await response.json();
                alert('Failed to add metric: ' + data.msg);
            }
        } catch (error) {
            console.error('Error adding metric:', error);
            alert('An error occurred while adding the metric.');
        }
    }

    // Add new metric (patient view)
    async function addPatientMetric(e) {
        e.preventDefault();
        
        const patientId = localStorage.getItem('patientId');
        if (!patientId) {
            alert('Patient ID not found.');
            return;
        }
        
        const metricType = document.getElementById('patient-new-metric-type').value;
        const metricValue = document.getElementById('patient-new-metric-value').value;
        
        try {
            const response = await fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    patient_id: parseInt(patientId),
                    type: metricType,
                    value: parseFloat(metricValue)
                })
            });
            
            if (response.ok) {
                alert('Metric added successfully!');
                patientAddMetricForm.reset();
                loadPatientMetrics(patientId);
            } else {
                const data = await response.json();
                alert('Failed to add metric: ' + data.msg);
            }
        } catch (error) {
            console.error('Error adding metric:', error);
            alert('An error occurred while adding the metric.');
        }
    }

    // Theme Toggle
    document.getElementById('theme-switch').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
    });

    // Notifications Toggle
    document.getElementById('notifications-btn').addEventListener('click', () => {
        document.querySelector('.notifications-panel').classList.toggle('hidden');
    });

    // Initialize Charts
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Blood Pressure',
                data: [120, 125, 118, 129, 116, 120],
                borderColor: '#00BFA6',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});
